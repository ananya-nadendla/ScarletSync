/********************************************************************
 * academicPlanUtil.js
 ********************************************************************/
import Solver from "javascript-lp-solver";
// If your JSON data is in the same folder or different folder, 
// adjust these paths accordingly.
import potentialClassesData from "../data/PotentialClasses.json";
import requirementsData from "../data/Requirements.json";
import completedClassesData from "../data/CompletedClasses.json";

// Utility: build a map of requirement -> total needed
function buildTotalRequirementsMap(requirementsList) {
  const map = {};
  requirementsList.forEach((r) => {
    map[r.requirement] = r.total || 0;
  });
  return map;
}

// Utility: build a map of requirement -> how many are already completed
function buildCompletedRequirementsMap(requirementsList) {
  const map = {};
  requirementsList.forEach((r) => {
    map[r.requirement] = r.completed || 0;
  });
  return map;
}

/**
 * This function is only used if you rely on completed classes 
 * for prereq logic. If you do NOT need them for fulfilling 
 * requirements (since you already updated them in Requirements.json), 
 * you can skip searching for 'fulfills' in completed classes.
 */
function buildCompletedClassesSet(completedClasses) {
  const s = new Set();
  completedClasses.forEach((c) => {
    s.add(c.id);
  });
  return s;
}

/**
 * Build a map of courseId -> { ...courseObject with arrays }
 * We remove leading/trailing spaces from the 'prerequisites' field 
 * and parse them as an array. We'll also fix slashes.
 */
function buildCourseMap(potentialClasses) {
  const courseMap = {};

  potentialClasses.forEach((course) => {
    let rawPrereqs = course.prerequisites || "";
    // Replace slashes with commas
    rawPrereqs = rawPrereqs.replace(/\//g, ",");

    // Split on commas
    const splitted = rawPrereqs.split(",").map((p) => p.trim()).filter(Boolean);

    // Now we handle "01:640:135/01:960:285/01:640:151" type combos 
    // that might remain. But we've replaced slashes so it's probably 
    // just splitted. If some remain with '/', you can do a second pass.

    // Convert "leadingSpaceCourse" => "leadingSpaceCourse" remove leading/trailing spaces
    const prereqArray = splitted.map((p) => p.replace(/^\s+|\s+$/g, ""));

    // Build the final course object
    courseMap[course.id] = {
      ...course,
      prerequisites: prereqArray
    };
  });

  return courseMap;
}

/**
 * Build a map of requirement -> list of course IDs that fulfill it.
 * Since you rely on Requirements.json for completed classes, 
 * you only do this for potential classes (not completed).
 */
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

export async function generateAcademicPlan() {
  try {
    const potentialClasses = potentialClassesData;
    const requirementsList = requirementsData;
    const completedClasses = completedClassesData;

    // Build needed data structures
    const totalReqsMap = buildTotalRequirementsMap(requirementsList);
    const completedReqsMap = buildCompletedRequirementsMap(requirementsList);
    const completedSet = buildCompletedClassesSet(completedClasses);
    const courseMap = buildCourseMap(potentialClasses);
    const reqToCoursesMap = buildRequirementToCoursesMap(potentialClasses);

    // We'll allow up to 9 semesters
    const semesterIndices = Array.from({ length: 9 }, (_, i) => i + 1);

    // Create the LP model
    const model = {
      optimize: "totalPenalty",
      opType: "min",
      constraints: {},
      variables: {},
      ints: {}
    };

    // 1) Decision vars: X_{courseId, sem} (binary)
    potentialClasses.forEach((course) => {
      if (completedSet.has(course.id)) {
        // skip if it's completed
        return;
      }
      semesterIndices.forEach((s) => {
        const varName = `X_${course.id}_${s}`;
        model.variables[varName] = { totalPenalty: 0 };
        model.ints[varName] = 1;
      });
    });

    // 2) Over/Under for each sem + "UseSem9"
    semesterIndices.forEach((s) => {
      // over_s, under_s
      const overVar = `over_${s}`;
      const underVar = `under_${s}`;
      model.variables[overVar] = { totalPenalty: 1 };
      model.variables[underVar] = { totalPenalty: 1 };
    });
    const useSem9 = "UseSem9";
    model.variables[useSem9] = { totalPenalty: 100 };
    model.ints[useSem9] = 1;

    /****************************************************************
     * 3) Constraints
     ****************************************************************/

    // 3.1 Requirements: sum(X) >= needed
    Object.keys(totalReqsMap).forEach((reqName) => {
      const totalNeeded = totalReqsMap[reqName];
      const alreadyDone = completedReqsMap[reqName] || 0;
      if (alreadyDone >= totalNeeded) {
        // no constraint needed; you already meet or exceed
        return;
      }
      const neededFromFuture = totalNeeded - alreadyDone;

      // gather all X_{course, s} for courses that can fulfill this req
      const coursesThatFulfill = reqToCoursesMap[reqName] || [];
      if (coursesThatFulfill.length === 0 && neededFromFuture > 0) {
        console.warn(`Requirement ${reqName} needs ${neededFromFuture} more but no course can fulfill it!`);
      }
      let expr = {};
      coursesThatFulfill.forEach((cId) => {
        // skip if completed
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

    // 3.2 Prerequisites: X_{c,s} <= sum_{prereqs}(X_{p,t < s} + 1_if_p_completed)
    Object.entries(courseMap).forEach(([cId, courseObj]) => {
      if (completedSet.has(cId)) return; // skip completed
      const prereqs = courseObj.prerequisites;
      if (!prereqs || prereqs.length === 0) return;

      const numPrereqs = prereqs.length;

      semesterIndices.forEach((s) => {
        // left side: X_{cId,s} * numPrereqs => we do -numPrereqs * X_{cId,s} in expression
        const varName = `X_${cId}_${s}`;
        let expr = { [varName]: -numPrereqs };

        // For each prerequisite p
        prereqs.forEach((p) => {
          // Trim leading/trailing spaces from p in case
          const cleanP = p.trim();

          // If the p is not in courseMap and not in completedSet, 
          // that means there's a potential data error
          if (!courseMap[cleanP] && !completedSet.has(cleanP)) {
            console.warn(`Prerequisite mismatch: course '${cleanP}' not found in PotentialClasses or CompletedSet. (prereq of ${cId})`);
          }

          if (completedSet.has(cleanP)) {
            // That prereq is effectively always satisfied => +1
            expr["__CONST__"] = (expr["__CONST__"] || 0) + 1;
          } else {
            // sum_{t < s} X_{p,t}
            for (let t = 1; t < s; t++) {
              const pVar = `X_${cleanP}_${t}`;
              // Only add if that pVar actually exists in model.variables
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

    // 3.3 Credit constraints per semester
    semesterIndices.forEach((s) => {
      let sumCreditsExpr = {};
      potentialClasses.forEach((c) => {
        if (completedSet.has(c.id)) return;
        const varName = `X_${c.id}_${s}`;
        sumCreditsExpr[varName] = (sumCreditsExpr[varName] || 0) + c.credits;
      });

      // Hard min: >= 12
      model.constraints[`minCredits_sem${s}`] = {
        min: 3,
        ...sumCreditsExpr
      };
      // Hard max: <= 19
      model.constraints[`maxCredits_sem${s}`] = {
        max: 30,
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

    // 3.4 If X_{c,9} = 1 => useSem9 = 1
    potentialClasses.forEach((c) => {
      if (completedSet.has(c.id)) return;
      const varName = `X_${c.id}_9`;
      model.constraints[`useSem9_${c.id}`] = {
        max: 0,
        [varName]: 1,
        [useSem9]: -1
      };
    });

    // 3.5 Each course can only be taken once => sum_{s=1..9} X_{c,s} <= 1
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

    /****************************************************************
     * 4) Solve
     ****************************************************************/
    console.log("=== MODEL DUMP ===", JSON.stringify(model, null, 2));
    console.log("PotentialClasses", potentialClasses);
    console.log("Requirements", requirementsList);
    console.log("CompletedClasses", completedClasses);
    
    const results = Solver.Solve(model);

    if (!results.feasible) {
      throw new Error("No feasible solution found. The LP model is infeasible.");
    }

    /****************************************************************
     * 5) Build the plan to return
     ****************************************************************/
    const plan = {};
    semesterIndices.forEach((s) => {
      plan[`Semester ${s}`] = [];
    });

    // gather all X_{course, s} = 1
    Object.keys(results).forEach((varName) => {
      if (varName.startsWith("X_") && results[varName] === 1) {
        // parse out the course
        // varName looks like "X_01:640:252_3"
        const parts = varName.split("_");
        // parts[1] = "01:640:252", parts[2] = "3"
        const cId = parts[1];
        const sem = parseInt(parts[2], 10);
        const cObj = courseMap[cId];
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

const model = {
  optimize: "someObj",
  opType: "min",
  constraints: {},
  variables: {
    "X_course1_sem1": { someObj: 0 },
    "X_course2_sem1": { someObj: 0 }
  },
  ints: {
    "X_course1_sem1": 1,
    "X_course2_sem1": 1
  }
};

const results = Solver.Solve(model);
console.log("miniTest results", results);

