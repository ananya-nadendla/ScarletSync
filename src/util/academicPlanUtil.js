// src/utils/academicPlanUtil.js

import solver from "javascript-lp-solver";

/*
  Expected JSON structure (academicPlanData.json):

  {
    "potentialClasses": [
      {
        "id": "CS101",
        "name": "Introduction to Computer Science",
        "credits": 3,
        "offeredSemesters": [1,2,3,4,5,6,7,8],
        "prerequisites": [],
        "corequisites": [],
        "fulfills": ["Requirement1", "Requirement3"]
      },
      {
        "id": "MATH201",
        "name": "Calculus II",
        "credits": 4,
        "offeredSemesters": [2,4,6,8],
        "prerequisites": ["MATH101"],
        "corequisites": [],
        "fulfills": ["Requirement2"]
      }
      // ... more courses
    ],
    "requirements": [
      {
        "name": "Requirement1",
        "classesTaken": 1,
        "classesNeeded": 2,
        "creditsNeeded": 0
      },
      {
        "name": "Requirement2",
        "classesTaken": 0,
        "classesNeeded": 3,
        "creditsNeeded": 12
      }
      // ... additional requirements
    ],
    "completedClasses": [
      { "id": "ENG101", "fulfills": ["Requirement1"] },
      { "id": "MATH101", "fulfills": ["Requirement2"] }
      // ... etc.
    ],
    "globalConstraints": {
      "maxCreditsPerSemester": 19
    }
  }
*/

// Fetch data from our exported JSON file.
export const fetchAcademicPlanData = async () => {
  const response = await fetch("/data/academicPlanData.json");
  if (!response.ok) {
    throw new Error("Failed to fetch academic plan data.");
  }
  const data = await response.json();
  return data;
};

// Build the LP model based on the academic data.
export const buildAcademicPlanModel = (academicData) => {
  const { potentialClasses, requirements, completedClasses, globalConstraints } = academicData;
  // Allow semesters 1 through 9 (we prefer to stay within 8).
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const maxCreditsPerSemester = globalConstraints.maxCreditsPerSemester;

  // Filter out classes already completed.
  const completedIds = completedClasses.map((c) => c.id);
  const pendingClasses = potentialClasses.filter(
    (course) => !completedIds.includes(course.id)
  );

  // Initialize LP model.
  let model = {
    optimize: "penalty",
    opType: "min",
    constraints: {},
    variables: {},
    ints: {}
  };

  // Weight to reward courses that fulfill multiple requirements.
  const fulfillsWeight = 0.7;

  // 1. Create decision variables.
  // For each pending course and each semester in which it is offered.
  pendingClasses.forEach((course) => {
    semesters.forEach((semester) => {
      // We assume courses are offered in their specified semesters.
      // We also allow scheduling in semester 9 if necessary.
      if (course.offeredSemesters.includes(semester) || (semester === 9)) {
        const varName = `x_${course.id}_${semester}`;
        let cost = 0;
        if (semester === 9) {
          cost = 9 + 100; // Very high penalty for using a 9th semester.
        } else {
          // Cost: prefer earlier semesters and lower cost for courses that fulfill more requirements.
          cost = (semester + 2) - (fulfillsWeight * (course.fulfills ? course.fulfills.length : 0));
        }
        model.variables[varName] = {
          penalty: cost,
          // Contribute course credits to the semester.
          [`credits_sem_${semester}`]: course.credits
        };
        model.ints[varName] = 1;
      }
    });
  });

  // 2. Requirement Constraints.
  // For each requirement, enforce two constraints:
  // (a) The count of scheduled courses fulfilling it must be >= (classesNeeded - classesTaken).
  // (b) If applicable, the total credits from scheduled courses fulfilling it must be >= creditsNeeded.
  requirements.forEach((req) => {
    const reqName = req.name;
    const minCourses = Math.max(0, req.classesNeeded - req.classesTaken);
    let countConstraint = {};
    let creditConstraint = {};
    pendingClasses.forEach((course) => {
      if (course.fulfills.includes(reqName)) {
        semesters.forEach((semester) => {
          const varName = `x_${course.id}_${semester}`;
          if (model.variables[varName]) {
            countConstraint[varName] = 1;
            // For credit constraint, add the course's credits.
            creditConstraint[varName] = course.credits;
          }
        });
      }
    });
    // Add the count constraint.
    model.constraints[`req_count_${reqName}`] = { min: minCourses, ...countConstraint };
    // Add the credit constraint if applicable.
    if (req.creditsNeeded && req.creditsNeeded > 0) {
      model.constraints[`req_credit_${reqName}`] = { min: req.creditsNeeded, ...creditConstraint };
    }
  });

  // 3. Credit Load Constraint per Semester.
  semesters.forEach((semester) => {
    let semConstraint = {};
    pendingClasses.forEach((course) => {
      const varName = `x_${course.id}_${semester}`;
      if (model.variables[varName]) {
        semConstraint[varName] = course.credits;
      }
    });
    model.constraints[`credits_sem_${semester}`] = { max: maxCreditsPerSemester, ...semConstraint };
  });

  // 4. Prerequisite Constraints.
  // For each pending course with prerequisites that are not completed,
  // enforce that if the course is scheduled in semester s, then at least one instance
  // of each prerequisite must be scheduled in some semester < s.
  pendingClasses.forEach((course) => {
    if (course.prerequisites && course.prerequisites.length > 0) {
      course.prerequisites.forEach((prereqId) => {
        if (completedIds.includes(prereqId)) return; // Skip if already completed.
        semesters.forEach((semester) => {
          const courseVar = `x_${course.id}_${semester}`;
          if (model.variables[courseVar]) {
            let prereqConstraint = {};
            for (let s = 1; s < semester; s++) {
              const prereqVar = `x_${prereqId}_${s}`;
              if (model.variables[prereqVar]) {
                prereqConstraint[prereqVar] = 1;
              }
            }
            if (Object.keys(prereqConstraint).length > 0) {
              // Model as: x_{course}_{semester} - (sum of prereq variables in earlier semesters) <= 0.
              model.constraints[`prereq_${course.id}_${prereqId}_${semester}`] = {
                max: 0,
                [courseVar]: 1,
                ...Object.keys(prereqConstraint).reduce((acc, key) => {
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

  // (Optional) Corequisite constraints could be added here similarly.

  return { model, semesters };
};

// Solve the LP model.
export const solveAcademicPlanModel = (model) => {
  const results = solver.Solve(model);
  return results;
};

// Main function to generate the academic plan.
export const generateAcademicPlan = async () => {
  try {
    const academicData = await fetchAcademicPlanData();
    const { model, semesters } = buildAcademicPlanModel(academicData);
    const solution = solveAcademicPlanModel(model);

    // Process solution into a schedule: { "Semester 1": [courseIDs], ... }.
    let plan = {};
    semesters.forEach((semester) => {
      plan[`Semester ${semester}`] = [];
    });
    Object.keys(solution).forEach((variable) => {
      if (variable.startsWith("x_") && solution[variable] === 1) {
        // Variable format: x_{courseId}_{semester}
        const parts = variable.split("_");
        const courseId = parts[1];
        const semester = parts[2];
        plan[`Semester ${semester}`].push(courseId);
      }
    });
    return plan;
  } catch (err) {
    throw new Error("Error generating academic plan: " + err.message);
  }
};
