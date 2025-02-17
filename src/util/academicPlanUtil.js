/********************************************************************
 * academicPlanUtil.js
 *
 * This code builds a linear (mixed-integer) program for scheduling
 * courses, but initially *all constraints* are commented out. 
 * 
 * HOW TO USE:
 *  1) Leave everything commented => no constraints => should be feasible.
 *  2) Uncomment each major block of constraints one by one to see 
 *     which block forces "infeasible."
 * 
 * Import paths and naming follow your original usage.
 ********************************************************************/
import Solver from "javascript-lp-solver";

// import your JSON data 
import potentialClassesData from "../data/PotentialClasses.json";
import requirementsData from "../data/Requirements.json";
import completedClassesData from "../data/CompletedClasses.json";

/************************************************************
 * 1. Utility Functions
 ************************************************************/

/** Build a map: requirement -> total needed (from Requirements.json) */
function buildTotalRequirementsMap(requirementsList) {
  const map = {};
  requirementsList.forEach((r) => {
    map[r.requirement] = r.total || 0;
  });
  return map;
}

/** Build a map: requirement -> how many are *already completed* */
function buildCompletedRequirementsMap(requirementsList) {
  const map = {};
  requirementsList.forEach((r) => {
    map[r.requirement] = r.completed || 0;
  });
  return map;
}

/** Gather a set of IDs for all completed classes (for skipping re-scheduling) */
function buildCompletedClassesSet(completedClasses) {
  const s = new Set();
  completedClasses.forEach((c) => {
    s.add(c.id);
  });
  return s;
}

/** 
 * Build a map: courseId -> courseData 
 * Also parse "prerequisites" (split on commas, slash replaced by comma).
 */
function buildCourseMap(potentialClasses) {
  const courseMap = {};
  potentialClasses.forEach((course) => {
    let rawPrereqs = course.prerequisites || "";
    // replace slashes with commas
    rawPrereqs = rawPrereqs.replace(/\//g, ",");
    // split on commas
    const parts = rawPrereqs
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    courseMap[course.id] = {
      ...course,
      prerequisites: parts
    };
  });
  return courseMap;
}

/** Build a map: requirement -> array of course IDs that fulfill it */
function buildRequirementToCoursesMap(potentialClasses) {
  const map = {};
  potentialClasses.forEach((course) => {
    if (!course.fulfills) return;
    const fulfillArr = course.fulfills.split(",").map((f) => f.trim()).filter(Boolean);
    fulfillArr.forEach((req) => {
      if (!map[req]) map[req] = [];
      map[req].push(course.id);
    });
  });
  return map;
}

/************************************************************
 * 2. Main LP-Solver Function
 ************************************************************/
export async function generateAcademicPlan() {
  try {
    /********************************************************
     * A) Load JSON data 
     ********************************************************/
    const potentialClasses = potentialClassesData;
    const requirementsList = requirementsData;
    const completedClasses = completedClassesData;

    /********************************************************
     * B) Build data structures
     ********************************************************/
    const totalReqsMap = buildTotalRequirementsMap(requirementsList);
    const completedReqsMap = buildCompletedRequirementsMap(requirementsList);
    const completedSet = buildCompletedClassesSet(completedClasses);
    const courseMap = buildCourseMap(potentialClasses);
    const reqToCoursesMap = buildRequirementToCoursesMap(potentialClasses);

    // We'll allow up to 9 semesters: 1..9
    const semesterIndices = Array.from({ length: 9 }, (_, i) => i + 1);

    // We'll define a special var to track 9th semester usage, if you want that
    const useSem9 = "UseSem9";

    /********************************************************
     * C) Build the LP model (NO CONSTRAINTS by default)
     ********************************************************/
    const model = {
      optimize: "totalPenalty",
      opType: "min",
      constraints: {},    // We'll add constraints below (commented)
      variables: {},
      ints: {}
    };

    /********************************************************
     * 1) Decision Variables: X_{course, s}
     ********************************************************/
    potentialClasses.forEach((course) => {
      // skip if already completed
      if (completedSet.has(course.id)) return;

      semesterIndices.forEach((s) => {
        const varName = `X_${course.id}_${s}`;
        model.variables[varName] = {
          // no direct penalty for picking a course
          totalPenalty: 0
        };
        model.ints[varName] = 1; // binary variable
      });
    });

    /********************************************************
     * 2) Over/Under credit variables and useSem9
     ********************************************************/
    // We'll define them, but *not* add constraints referencing them
    semesterIndices.forEach((s) => {
      const overVar = `over_${s}`;
      const underVar = `under_${s}`;
      model.variables[overVar] = {
        totalPenalty: 1
      };
      model.variables[underVar] = {
        totalPenalty: 1
      };
    });
    model.variables[useSem9] = { totalPenalty: 100 };
    model.ints[useSem9] = 1;

    /********************************************************
     * ********** COMMENTED-OUT CONSTRAINT BLOCKS ***********
     *
     * Uncomment them one by one to see which causes infeasibility.
     ********************************************************/

    /*
    //-------------------------------------------------------
    // A) Requirements: sum(X) >= needed
    //-------------------------------------------------------
    Object.keys(totalReqsMap).forEach((reqName) => {
      const totalNeeded = totalReqsMap[reqName];
      const alreadyDone = completedReqsMap[reqName] || 0;
      if (alreadyDone >= totalNeeded) {
        // already satisfied or over-satisfied
        return;
      }
      const neededFromFuture = totalNeeded - alreadyDone;

      // gather courses that can fulfill
      const coursesThatFulfill = reqToCoursesMap[reqName] || [];
      if (coursesThatFulfill.length === 0 && neededFromFuture > 0) {
        console.warn(`Requirement ${reqName} needs ${neededFromFuture} more but no course can fulfill it!`);
      }

      let expr = {};
      coursesThatFulfill.forEach((cId) => {
        if (completedSet.has(cId)) return;
        semesterIndices.forEach((s) => {
          const varName = `X_${cId}_${s}`;
          expr[varName] = (expr[varName] || 0) + 1;
        });
      });

      model.constraints[`req_${reqName}`] = {
        min: neededFromFuture,
        ...expr
      };
    });
*/    

    
    //-------------------------------------------------------
    // B) Prerequisites
    //-------------------------------------------------------
    Object.entries(courseMap).forEach(([cId, courseObj]) => {
      if (completedSet.has(cId)) return;
      const prereqs = courseObj.prerequisites || [];
      if (!prereqs.length) return;

      const numPrereqs = prereqs.length;

      semesterIndices.forEach((s) => {
        // left side is X_{cId,s} * numPrereqs => in linear form we do -numPrereqs * X_{cId,s}
        const varName = `X_${cId}_${s}`;
        let expr = { [varName]: -numPrereqs };

        prereqs.forEach((p) => {
          // if p is completed, we effectively add 1
          if (completedSet.has(p)) {
            expr["__CONST__"] = (expr["__CONST__"] || 0) + 1;
          } else {
            // sum_{t < s} X_{p,t}
            for (let t = 1; t < s; t++) {
              const pVar = `X_${p}_${t}`;
              if (model.variables[pVar]) {
                expr[pVar] = (expr[pVar] || 0) + 1;
              }
            }
          }
        });

        // sum(...) >= 0
        model.constraints[`prereq_${cId}_${s}`] = {
          min: 0,
          ...expr
        };
      });
    });
    

    /*
    //-------------------------------------------------------
    // C) Credit Load Constraints
    //-------------------------------------------------------
    semesterIndices.forEach((s) => {
      let sumCreditsExpr = {};
      potentialClasses.forEach((c) => {
        if (completedSet.has(c.id)) return;
        const varName = `X_${c.id}_${s}`;
        sumCreditsExpr[varName] = (sumCreditsExpr[varName] || 0) + c.credits;
      });

      // Hard min: 12, Hard max: 19
      model.constraints[`minCredits_sem${s}`] = {
        min: 12,
        ...sumCreditsExpr
      };
      model.constraints[`maxCredits_sem${s}`] = {
        max: 19,
        ...sumCreditsExpr
      };

      // OverVar => sumCredits - over_s <= 17
      const overVar = `over_${s}`;
      {
        let expr = { ...sumCreditsExpr };
        expr[overVar] = -1;
        model.constraints[`overConstraint_sem${s}`] = {
          max: 17,
          ...expr
        };
      }

      // UnderVar => sumCredits + under_s >= 14 => -sumCredits + under_s >= -14
      const underVar = `under_${s}`;
      {
        let expr = {};
        Object.entries(sumCreditsExpr).forEach(([k, v]) => {
          expr[k] = -v;
        });
        expr[underVar] = 1;
        model.constraints[`underConstraint_sem${s}`] = {
          min: -14,
          ...expr
        };
      }
    });
    */

    
    //-------------------------------------------------------
    // D) If X_{c,9} = 1 => useSem9 = 1
    //-------------------------------------------------------
    potentialClasses.forEach((c) => {
      if (completedSet.has(c.id)) return;
      const varName = `X_${c.id}_9`;
      model.constraints[`useSem9_${c.id}`] = {
        max: 0,
        [varName]: 1,
        [useSem9]: -1
      };
    });
    

    
    //-------------------------------------------------------
    // E) Single-Semester: sum_{s=1..9} X_{c,s} <= 1
    //-------------------------------------------------------
    potentialClasses.forEach((c) => {
      if (completedSet.has(c.id)) return;
      let expr = {};
      semesterIndices.forEach((s) => {
        expr[`X_${c.id}_${s}`] = 1;
      });
      model.constraints[`singleSemester_${c.id}`] = {
        max: 1,
        ...expr
      };
    });
    

    /********************************************************
     * 4) Solve the Model
     ********************************************************/
    console.log("==== MODEL (no constraints) DUMP ====", JSON.stringify(model, null, 2));

    const results = Solver.Solve(model);
    console.log("==== SOLVE RESULTS (no constraints) ====", results);

    if (!results.feasible) {
      throw new Error("No feasible solution found (with constraints commented out).");
    }

    /********************************************************
     * 5) Build a Plan (though it's not very meaningful 
     *    without constraints)
     ********************************************************/
    const plan = {};
    semesterIndices.forEach((s) => {
      plan[`Semester ${s}`] = [];
    });

    // gather all X_{course, s} = 1 if the solver sets them
    Object.keys(results).forEach((varName) => {
      if (varName.startsWith("X_") && results[varName] === 1) {
        const parts = varName.split("_"); // e.g. ["X","01:640:252","2"]
        const courseId = parts[1];
        const sem = parseInt(parts[2], 10);
        const cObj = courseMap[courseId];
        if (cObj) {
          plan[`Semester ${sem}`].push(cObj);
        }
      }
    });

    return plan;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/************************************************************
 * 3. A Mini Test for reference
 ************************************************************/
function miniTest() {
  const model = {
    optimize: "dummyObj",
    opType: "min",
    constraints: {},
    variables: {
      "X_course1_sem1": { dummyObj: 0 },
      "X_course2_sem1": { dummyObj: 0 }
    },
    ints: {
      "X_course1_sem1": 1,
      "X_course2_sem1": 1
    }
  };
  const result = Solver.Solve(model);
  console.log("miniTest results =>", result);
}

// Automatically run the miniTest at import time (optional)
miniTest();
