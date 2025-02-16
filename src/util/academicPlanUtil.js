// src/util/academicPlanUtil.js

import solver from "javascript-lp-solver";

/*
  This file builds a linear programming (LP) model to generate an academic plan
  based on three sets of data:
  
  1. PotentialClasses.json: Lists all available courses. Each course includes:
     - id: Course identifier.
     - name: Course title.
     - credits: Number of credits.
     - prerequisites: A string listing prerequisites (groups separated by commas;
       alternatives in a group are separated by a slash). No concurrent enrollment allowed.
     - fulfills: A comma-separated list of requirement codes that the course can satisfy.
  
  2. Requirements.json: Lists the requirements with:
     - requirement: The code of the requirement.
     - total: Total number of courses required.
     - completed: Number of courses already taken that fulfill this requirement.
  
  3. CompletedClasses.json: Lists courses already completed (with the semester taken).
  
  The goal is to schedule the remaining (pending) courses in the upcoming semesters.
  - Semesters 1 & 2 are already completed.
  - We plan for semesters 3–8 (6 semesters) ideally, with semester 9 allowed only as a fallback.
  - Each planned semester must have between 12 and 19 credits (aiming for 15–17 if possible).
  - Prerequisite constraints enforce that if a course is scheduled in semester S,
    at least one of its prerequisite alternatives must be scheduled in a semester strictly less than S.
*/

// ---------------------------------------------------------------------
// 1. Data Fetching: Retrieve JSON data from the public folder.
export const fetchAcademicPlanData = async () => {
  // Fetch all three JSON files concurrently.
  const [potentialRes, requirementsRes, completedRes] = await Promise.all([
    fetch("/data/PotentialClasses.json"),
    fetch("/data/Requirements.json"),
    fetch("/data/CompletedClasses.json"),
  ]);

  // Check if all fetches were successful.
  if (!potentialRes.ok || !requirementsRes.ok || !completedRes.ok) {
    throw new Error("Failed to fetch one or more academic plan data files.");
  }

  // Parse the JSON responses.
  const potentialClasses = await potentialRes.json();
  const requirements = await requirementsRes.json();
  const completedClasses = await completedRes.json();

  // Global constraints: maximum credits per semester.
  const globalConstraints = { maxCreditsPerSemester: 19 , minCreditsPerSemester: 12 };


  return { potentialClasses, requirements, completedClasses, globalConstraints };
};

// ---------------------------------------------------------------------
// Helper: Convert a comma-separated string into an array (with trimming).
const toArray = (str) => {
  return str && str.trim() !== "" ? str.split(",").map(s => s.trim()) : [];
};

// ---------------------------------------------------------------------
// 2. Build the LP Model.
// This function builds an LP model based on the academic data.
export const buildAcademicPlanModel = (academicData) => {
  const { potentialClasses, requirements, completedClasses, globalConstraints } = academicData;

  // We plan pending courses only in semesters 3 to 8.
  // (Semester 9 is allowed as a fallback with a heavy penalty.)
  const planningSemesters = [3, 4, 5, 6, 7, 8, 9];

  // Set the hard maximum and minimum credits per semester.
  const maxCredits = globalConstraints.maxCreditsPerSemester; // 19 credits max.
  const minCredits = globalConstraints.mminCreditsPerSemester; // 12 credits minimum per semester (for planning semesters 3-8).

  // Get IDs of already completed courses.
  const completedIds = completedClasses.map(c => c.id);

  // Filter out courses that have already been taken.
  const pendingClasses = potentialClasses.filter(course => !completedIds.includes(course.id));

  // Build a lookup map for pending courses.
  const pendingMap = {};
  pendingClasses.forEach(course => {
    pendingMap[course.id] = course;
    // Convert the 'fulfills' string into an array.
    course.fulfillArray = toArray(course.fulfills);
  });

  // Initialize the LP model.
  let model = {
    optimize: "penalty",  // We minimize the total penalty.
    opType: "min",
    constraints: {},
    variables: {},
    ints: {}  // Decision variables are binary.
  };

  // -------------------------------------------------------------------
  // 3. Create Decision Variables.
  // For each pending course and each planning semester, create a binary variable:
  // x_{course.id}_{semester} = 1 if the course is scheduled in that semester.
  pendingClasses.forEach(course => {
    planningSemesters.forEach(semester => {
      const varName = `x_${course.id}_${semester}`;
      let cost;
      // Impose a heavy penalty for scheduling in semester 9.
      if (semester === 9) {
        cost = 9 + 100;
      } else {
        // Otherwise, cost equals the semester number (lower is better).
        cost = semester;
      }
      // Define the variable with its cost and credit contribution.
      model.variables[varName] = {
        penalty: cost,
        [`credits_sem_${semester}`]: course.credits
      };
      model.ints[varName] = 1;
    });
  });

  // -------------------------------------------------------------------
  // 4. Requirement Constraints.
  // For each requirement, ensure that the sum of decision variables for courses that fulfill it
  // is at least the additional number needed (total - completed).
  requirements.forEach(req => {
    const reqName = req.requirement;
    // Calculate how many more courses are needed for this requirement.
    const needed = Math.max(0, req.total - req.completed);
    let reqConstraint = {};
    pendingClasses.forEach(course => {
      // If the course fulfills the requirement...
      if (course.fulfillArray.includes(reqName)) {
        planningSemesters.forEach(semester => {
          const varName = `x_${course.id}_${semester}`;
          if (model.variables[varName]) {
            reqConstraint[varName] = 1;
          }
        });
      }
    });
    // Add a constraint: sum of decision variables >= needed.
    model.constraints[`req_count_${reqName}`] = { min: needed, ...reqConstraint };
  });

  // -------------------------------------------------------------------
  // 5. Credit Load Constraints.
  // (a) Upper Bound: For each planning semester, total scheduled credits must not exceed maxCredits.
  planningSemesters.forEach(semester => {
    let creditConstraint = {};
    pendingClasses.forEach(course => {
      const varName = `x_${course.id}_${semester}`;
      if (model.variables[varName]) {
        creditConstraint[varName] = course.credits;
      }
    });
    model.constraints[`credits_sem_${semester}`] = { max: maxCredits, ...creditConstraint };
  });
  
  // (b) Lower Bound: For each planning semester (3-8), ensure at least minCredits are scheduled.
  planningSemesters.forEach(semester => {
    if (semester < 9) {  // Only enforce on semesters 3 through 8.
      let creditMinConstraint = {};
      pendingClasses.forEach(course => {
        const varName = `x_${course.id}_${semester}`;
        if (model.variables[varName]) {
          creditMinConstraint[varName] = course.credits;
        }
      });
      model.constraints[`credits_sem_${semester}_min`] = { min: minCredits, ...creditMinConstraint };
    }
  });

  // -------------------------------------------------------------------
  // 6. Prerequisite Constraints (No Concurrent Enrollment).
  // For each pending course that has prerequisites, enforce that for each group of alternatives:
  // If the course is scheduled in semester S, then at least one alternative must be scheduled in a semester strictly less than S.
  pendingClasses.forEach(course => {
    if (course.prerequisites && course.prerequisites.trim() !== "") {
      // Split prerequisites by commas into groups.
      const prereqGroups = course.prerequisites.split(",").map(group => group.trim());
      prereqGroups.forEach((group, groupIndex) => {
        // Within a group, alternatives are separated by slashes.
        const alternatives = group.split("/").map(s => s.trim());
        planningSemesters.forEach(semester => {
          const courseVar = `x_${course.id}_${semester}`;
          if (model.variables[courseVar]) {
            let altConstraint = {};
            // Consider only those semesters strictly less than the current semester.
            for (let s of planningSemesters.filter(s => s < semester)) {
              alternatives.forEach(alt => {
                const altVar = `x_${alt}_${s}`;
                if (model.variables[altVar]) {
                  altConstraint[altVar] = 1;
                }
              });
            }
            if (Object.keys(altConstraint).length > 0) {
              // Constraint: x_{course}_{semester} - (sum of alternative variables from earlier semesters) <= 0.
              model.constraints[`prereq_${course.id}_group${groupIndex}_sem${semester}`] = {
                max: 0,
                [courseVar]: 1,
                ...Object.keys(altConstraint).reduce((acc, key) => {
                  acc[key] = -1;
                  return acc;
                }, {})
              };
            }
          }
        });
      });
    }
  });

  // Uncomment the following line to log the built LP model for debugging.
  // console.log("LP Model:", JSON.stringify(model, null, 2));

  // Return the LP model, the list of planning semesters, and the pendingMap.
  return { model, semesters: planningSemesters, pendingMap };
};

// -------------------------------------------------------------------
// 7. Solve the LP Model.
// This function runs the solver on the built model.
export const solveAcademicPlanModel = (model) => {
  return solver.Solve(model);
};

// -------------------------------------------------------------------
// 8. Generate the Academic Plan.
// This function fetches the data, builds the model, solves it, and processes the solution
// into a plan that maps each semester to an array of courses (each with id and name).
export const generateAcademicPlan = async () => {
  try {
    // Fetch all academic plan data.
    const academicData = await fetchAcademicPlanData();
    // Build the LP model from the data.
    const { model, semesters, pendingMap } = buildAcademicPlanModel(academicData);
    // Solve the model.
    const solution = solveAcademicPlanModel(model);
    console.log("LP Solution:", solution);

    // Initialize a plan object for each planning semester.
    let plan = {};
    semesters.forEach(semester => {
      plan[`Semester ${semester}`] = [];
    });
    // Process each decision variable in the solution.
    // If a variable is set to 1, add that course to its corresponding semester.
    Object.keys(solution).forEach(variable => {
      if (variable.startsWith("x_") && Math.abs(solution[variable] - 1) < 1e-6) {
        const parts = variable.split("_");
        const courseId = parts[1];
        const semester = parts[2];
        plan[`Semester ${semester}`].push({
          id: pendingMap[courseId].id,
          name: pendingMap[courseId].name
        });
      }
    });

    // Add completed courses (from CompletedClasses.json) to semesters 1 and 2.
    academicData.completedClasses.forEach(course => {
      const sem = course.semester;
      if (sem === 1 || sem === 2) {
        if (!plan[`Semester ${sem}`]) {
          plan[`Semester ${sem}`] = [];
        }
        plan[`Semester ${sem}`].push({
          id: course.id,
          name: course.name
        });
      }
    });

    return plan;
  } catch (err) {
    throw new Error("Error generating academic plan: " + err.message);
  }
};
