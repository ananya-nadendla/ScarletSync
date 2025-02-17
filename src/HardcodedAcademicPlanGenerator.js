// src/components/HardcodedAcademicPlanGenerator.js
import React, { useState } from "react";

/**
 * Two example 8-semester schedules.
 * You can tweak them or expand further.
 */

const planA = {
  "Semester 1": [
    // Already scheduled
    { id: "01:640:252", name: "Elementary Differential Equations", credits: 3 },
    { id: "01:220:103", name: "Introduction to Macroeconomics", credits: 3 },
    { id: "01:220:120", name: "Inequality", credits: 4 },
    { id: "01:355:202", name: "Technical Writing Essentials", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ],
  "Semester 2": [
    // Already scheduled
    { id: "01:220:320", name: "Intermediate Microeconomics", credits: 3 },
    { id: "01:220:321", name: "Intermediate Macroeconomics", credits: 3 },
    { id: "01:220:322", name: "Econometrics", credits: 3 },
    { id: "01:640:311", name: "Intro to Real Analysis I", credits: 4 },
    { id: "01:014:264", name: "Black Lives Matter (CCD)", credits: 3 }
  ],
  "Semester 3": [
    { id: "01:640:350", name: "Linear Algebra (Upper)", credits: 3 },
    { id: "01:640:312", name: "Intro to Real Analysis II", credits: 3 },
    { id: "01:220:410", name: "Advanced Macroeconomic Theory", credits: 3 },
    { id: "01:220:411", name: "Global Financial Crises", credits: 3 },
    { id: "01:506:216", name: "Law and History (HST)", credits: 3 }
  ],
  "Semester 4": [
    { id: "01:640:356", name: "Theory of Numbers", credits: 3 },
    { id: "01:640:361", name: "Set Theory", credits: 3 },
    { id: "01:220:412", name: "Monetary Theory and Policy", credits: 3 },
    { id: "01:220:413", name: "Financial Economics", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ],
  "Semester 5": [
    { id: "01:640:373", name: "Numerical Analysis I", credits: 3 },
    { id: "01:220:300", name: "International Economics (LEC)", credits: 3 },
    { id: "01:220:301", name: "Money, Banking & Financial System (LEC)", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ],
  "Semester 6": [
    { id: "01:640:421", name: "Advanced Calculus for Engineering", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ],
  "Semester 7": [
    { id: "01:640:411", name: "Mathematical Analysis I", credits: 3 },
    { id: "01:220:414", name: "Economics of Capital Markets", credits: 3 },
    { id: "01:220:420", name: "Computational Methods (Econ)", credits: 3 },
    { id: "01:220:415", name: "Portfolio Theory", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ],
  "Semester 8": [
    { id: "01:640:412", name: "Mathematical Analysis II", credits: 3 },
    { id: "01:640:428", name: "Graph Theory", credits: 3 },
    { id: "01:220:424", name: "Advanced Analytics for Econ", credits: 3 },
    { id: "01:220:421", name: "Econ Forecasting & Big Data", credits: 3 },
    { id: "01:220:432", name: "Environmental Economics", credits: 3 }
  ]
};

const planB = {
  "Semester 1": [
    // Already scheduled
    { id: "01:640:252", name: "Elementary Differential Equations", credits: 3 },
    { id: "01:220:103", name: "Intro to Macroeconomics", credits: 3 },
    { id: "01:220:120", name: "Inequality (CCO,SCL,LEC)", credits: 4 },
    { id: "01:355:202", name: "Technical Writing (WCr)", credits: 3 },
    { id: "01:730:107", name: "Intro to Ethics (AH)", credits: 3 }
  ],
  "Semester 2": [
    // Already scheduled
    { id: "01:220:320", name: "Intermediate Microeconomics", credits: 3 },
    { id: "01:220:321", name: "Intermediate Macroeconomics", credits: 3 },
    { id: "01:220:322", name: "Econometrics", credits: 3 },
    { id: "01:640:311", name: "Intro to Real Analysis I", credits: 4 },
    { id: "01:014:264", name: "Black Lives Matter (CCD)", credits: 3 }
  ],
  "Semester 3": [
    { id: "01:640:350", name: "Linear Algebra (Upper)", credits: 3 },
    { id: "01:640:312", name: "Intro to Real Analysis II", credits: 3 },
    { id: "01:220:412", name: "Monetary Theory and Policy", credits: 3 },
    { id: "01:220:413", name: "Financial Economics", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ],
  "Semester 4": [
    { id: "01:640:356", name: "Theory of Numbers", credits: 3 },
    { id: "01:640:361", name: "Set Theory", credits: 3 },
    { id: "01:220:410", name: "Advanced Macroeconomic Theory", credits: 3 },
    { id: "01:220:411", name: "Global Financial Crises", credits: 3 },
    { id: "01:506:216", name: "Law and History (HST)", credits: 3 }
  ],
  "Semester 5": [
    { id: "01:640:373", name: "Numerical Analysis I", credits: 3 },
    { id: "01:640:421", name: "Adv Calculus for Engineering", credits: 3 },
    { id: "01:220:300", name: "International Economics (LEC)", credits: 3 },
    { id: "01:220:301", name: "Money, Banking & Fin. System", credits: 3 },
    { id: "01:014:305", name: "Race, International Law & Empire", credits: 3 }
  ],
  "Semester 6": [
    { id: "01:640:411", name: "Mathematical Analysis I", credits: 3 },
    { id: "01:640:412", name: "Mathematical Analysis II", credits: 3 },
    { id: "01:220:415", name: "Portfolio Theory", credits: 3 },
    { id: "01:220:420", name: "Computational Methods (Econ)", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ],
  "Semester 7": [
    { id: "01:640:428", name: "Graph Theory", credits: 3 },
    { id: "01:640:454", name: "Combinatorics", credits: 3 },
    { id: "01:220:421", name: "Econ Forecasting & Big Data", credits: 3 },
    { id: "01:220:422", name: "Some Potential Future Econ Class", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ],
  "Semester 8": [
    { id: "01:640:361", name: "Set Theory (Revisit or Alt?)", credits: 3 },
    { id: "01:640:373", name: "Numerical Analysis I (Alt) ", credits: 3 },
    { id: "01:220:414", name: "Economics of Capital Markets", credits: 3 },
    { id: "01:220:424", name: "Advanced Analytics for Econ", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
  ]
};

/**
 * A React component that toggles between two hard-coded plans 
 * (Plan A and Plan B) every time the "Generate Plan" button is clicked.
 */
function HardcodedAcademicPlanGenerator() {
  const [planIndex, setPlanIndex] = useState(0); // 0 => planA, 1 => planB
  const [plan, setPlan] = useState(planA);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = () => {
    // Simulate a 1-second "generation" delay
    setLoading(true);
    setTimeout(() => {
      // Toggle between 0 and 1
      const newIndex = planIndex === 0 ? 1 : 0;
      setPlanIndex(newIndex);
      // Switch plan
      setPlan(newIndex === 0 ? planA : planB);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ margin: "1rem" }}>
      <h1>Academic Plan Generator</h1>
      <p>
        Generate a four year academic plan!
      </p>
      <button onClick={handleGeneratePlan} disabled={loading}>
        {loading ? "Generating..." : "Generate Plan"}
      </button>

      {Object.keys(plan).length > 0 && !loading && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Plan {planIndex === 0 ? "A" : "B"}</h2>
          {Object.keys(plan)
            .sort((a, b) => {
              // sort by semester number if you want 
              const semA = parseInt(a.split(" ")[1], 10);
              const semB = parseInt(b.split(" ")[1], 10);
              return semA - semB;
            })
            .map((semesterKey) => (
              <div key={semesterKey} style={{ marginBottom: "1rem" }}>
                <h3>{semesterKey}</h3>
                {plan[semesterKey].length > 0 ? (
                  <ul>
                    {plan[semesterKey].map((course, idx) => (
                      <li key={idx}>
                        {course.id} - {course.name} ({course.credits} cr)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No courses scheduled.</p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default HardcodedAcademicPlanGenerator;
