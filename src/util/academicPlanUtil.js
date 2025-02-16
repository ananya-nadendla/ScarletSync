// src/util/academicPlanUtil.js

import solver from "javascript-lp-solver";

/*
  Expected JSON structures:

  CompletedClasses.json (array of objects):
  [
    {
      "id": "01:640:250",
      "name": "Introductory Linear Algebra",
      "credits": 3,
      "semester": 1
    },
    ... 
  ]

  Requirements.json (array of objects):
  [
    {
      "requirement": "M151",
      "total": 1,
      "completed": 1
    },
    {
      "requirement": "M252",
      "total": 1,
      "completed": 0
    },
    ... 
  ]

  PotentialClasses.json (array of objects):
  [
    {
      "id": "01:640:104",
      "name": "Introduction to Probability",
      "credits": 3,
      "prerequisites": "",
      "fulfills": "QQ"
    },
    {
      "id": "01:640:151",
      "name": "Calculus I for Mathematical and Physical Sciences",
      "credits": 4,
      "prerequisites": "",
      "fulfills": "M151,CC,QQ,QR"
    },
    // ...
  ]
*/

// Fetch data from our JSON files in public/data.
export const fetchAcademicPlanData = async () => {
  const [
    potentialRes,
    requirementsRes,
    completedRes,
  ] = await Promise.all([
    fetch("/data/potentialClasses.json"),
    fetch("/data/requirements.json"),
    fetch("/data/completedClasses.json"),
  ]);

  if (!potentialRes.ok || !requirementsRes.ok || !completedRes.ok) {
    throw new Error("Failed to fetch one or more academic plan data files.");
  }

  const potentialClasses = await potentialRes.json();
  const requirements = await requirementsRes.json();
  const completedClasses = await completedRes.json();

  // Define global constraints.
  const globalConstraints = {
    maxCreditsPerSemester: 19,
  };

  return { potentialClasses, requirements, completedClasses, globalConstraints };
};

// Helper: Convert a comma-separated string into an array (trimming each element).
const toArray = (str) => {
  return str && str.trim() !== "" ? str.split(",").map(s => s.trim()) : [];
};

// Build the LP model based on the academic data.
export const buildAcademicPlanModel = (academicData) => {
  const { potentialClasses, requirements, completedClasses, globalConstraints } = academicData;
  
  // Allowed semesters for scheduling pending courses: semesters 3 to 9.
  const semesters = [3, 4, 5, 6, 7, 8, 9];
  const maxCreditsPerSemester = globalConstraints.maxCreditsPerSemester;

  // Get IDs of completed courses.
  const completedIds = completedClasses.map(c => c.id);

  // Filter out courses that are already completed.
  const pendingClasses = potentialClasses.filter(course => !completedIds.includes(course.id));

  // Create a mapping from course id to course details for later lookup.
  const pendingMap = {};
  pendingClasses.forEach(course => {
    pendingMap[course.id] = course;
    // Convert 'fulfills' to an array.
    course.fulfillArray = toArray(course.fulfills);
  });

  // Initialize LP model.
  let model = {
    optimize: "penalty",
    opType: "min",
    constraints: {},
    variables: {},
    ints: {}
  };

  // For now, we’ll use a simpler cost function:
  // For semesters 3-8, cost = semester.
  // For semester 9, cost = 9 + 100 (a heavy penalty).
  pendingClasses.forEach(course => {
    semesters.forEach(semester => {
      const varName = `x_${course.id}_${semester}`;
      let cost = 0;
      if (semester === 9) {
        cost = 9 + 100;
      } else {
        cost = semester;
      }
      model.variables[varName] = {
        penalty: cost,
        [`credits_sem_${semester}`]: course.credits
      };
      model.ints[varName] = 1;
    });
  });

  // 2. Requirement Constraints.
  // For each requirement, enforce that the number of additional courses scheduled that fulfill it
  // must be at least: needed = total - completed.
  requirements.forEach(req => {
    const reqName = req.requirement;
    const needed = Math.max(0, req.total - req.completed);
    let reqCountConstraint = {};
    pendingClasses.forEach(course => {
      if (course.fulfillArray.includes(reqName)) {
        semesters.forEach(semester => {
          const varName = `x_${course.id}_${semester}`;
          if (model.variables[varName]) {
            reqCountConstraint[varName] = 1;
          }
        });
      }
    });
    model.constraints[`req_count_${reqName}`] = { min: needed, ...reqCountConstraint };
  });

  // 3. Credit Load Constraint per Semester.
  semesters.forEach(semester => {
    let semConstraint = {};
    pendingClasses.forEach(course => {
      const varName = `x_${course.id}_${semester}`;
      if (model.variables[varName]) {
        semConstraint[varName] = course.credits;
      }
    });
    model.constraints[`credits_sem_${semester}`] = { max: maxCreditsPerSemester, ...semConstraint };
  });

  // 4. Prerequisite Constraints.
  // For each pending course with prerequisites (nonempty string), enforce that for each prerequisite group,
  // if the course is scheduled in semester S, then at least one alternative from that group is scheduled in a semester less than S.
  pendingClasses.forEach(course => {
    if (course.prerequisites && course.prerequisites.trim() !== "") {
      const prereqGroups = course.prerequisites.split(",").map(group => group.trim());
      prereqGroups.forEach((group, groupIndex) => {
        const alternatives = group.split("/").map(s => s.trim());
        semesters.forEach((semester) => {
          const courseVar = `x_${course.id}_${semester}`;
          if (model.variables[courseVar]) {
            let altConstraint = {};
            for (let s = Math.min(...semesters); s < semester; s++) {
              alternatives.forEach(alt => {
                const altVar = `x_${alt}_${s}`;
                if (model.variables[altVar]) {
                  altConstraint[altVar] = 1;
                }
              });
            }
            if (Object.keys(altConstraint).length > 0) {
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

  // Optional: Uncomment the following line to log the model for debugging.
  // console.log("LP Model:", JSON.stringify(model, null, 2));

  return { model, semesters, pendingMap };
};

// Solve the LP model.
export const solveAcademicPlanModel = (model) => {
  return solver.Solve(model);
};

// Main function to generate the academic plan.
export const generateAcademicPlan = async () => {
  try {
    const academicData = await fetchAcademicPlanData();
    const { model, semesters, pendingMap } = buildAcademicPlanModel(academicData);
    const solution = solveAcademicPlanModel(model);
    console.log("LP Solution:", solution);

    // Process the LP solution into a schedule for semesters 3-9.
    let plan = {};
    semesters.forEach(semester => {
      plan[`Semester ${semester}`] = [];
    });
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

    // Add completed courses from semesters 1 and 2.
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
