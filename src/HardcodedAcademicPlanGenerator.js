// src/components/HardcodedAcademicPlanGenerator.js
import React, { useState } from "react";
import "./styles/HardcodedAcademicPlanGenerator.css"; // Import the CSS file


// HardcodedAcademicPlanGenerator.js (snippets)

// Two hard-coded 8-semester plans (Plan A and Plan B)

// PLAN A
const planA = {
  // === Keep Semester 1 from CompletedClasses.json ===
  "Semester 1": [
    { id: "01:640:250", name: "Introductory Linear Algebra", credits: 3 },
    { id: "01:830:321", name: "SOCIAL PSYCHOLOGY", credits: 3 },
    { id: "01:940:132", name: "Intermediate Spanish", credits: 4 },
    { id: "01:090:125", name: "Honors College Forum", credits: 3 },
    { id: "01:090:103", name: "CROSS-CULTURAL COMPETENCY", credits: 1 }
    // Total = 14 credits
  ],

  // === Keep Semester 2 from CompletedClasses.json ===
  "Semester 2": [
    { id: "07:965:211", name: "Theater Appreciation: Experiences in Contemporary Theater", credits: 3 },
    { id: "01:830:340", name: "PSYCHOPATHOLOGY", credits: 3 },
    { id: "01:730:104", name: "Intro to Philosophy - Writing Intensive", credits: 4 },
    { id: "01:640:300", name: "Intro to Mathematical Reasoning", credits: 3 },
    { id: "01:640:251", name: "Multivariable Calculus", credits: 4 },
    { id: "01:220:102", name: "Intro to Microeconomics", credits: 3 }
    // Total ~ 20 credits (we keep it as is, per your CompletedClasses)
  ],

  // === Fill Semesters 3–8 to complete requirements (approx. 14–17 credits each) ===
  "Semester 3": [
    { id: "01:640:252", name: "Elementary Differential Equations", credits: 3 },
    { id: "01:220:103", name: "Intro to Macroeconomics", credits: 3 },
    { id: "01:355:202", name: "Technical Writing Essentials", credits: 3 },
    { id: "01:640:311", name: "Intro to Real Analysis I", credits: 4 },
    { id: "00:000:000", name: "Elective of Choice", credits: 2 }
    // Total = 15
  ],
  "Semester 4": [
    { id: "01:640:312", name: "Intro to Real Analysis II", credits: 3 },
    { id: "01:640:350", name: "Linear Algebra", credits: 3 },
    { id: "01:220:410", name: "Advanced Macroeconomic Theory", credits: 3 },
    { id: "01:220:411", name: "Global Financial Crises", credits: 3 },
    { id: "01:506:216", name: "Law and History", credits: 3 }
    // Total = 15
  ],
  "Semester 5": [
    { id: "01:640:356", name: "Theory of Numbers", credits: 3 },
    { id: "01:640:361", name: "Set Theory", credits: 3 },
    { id: "01:220:412", name: "Monetary Theory and Policy", credits: 3 },
    { id: "01:220:413", name: "Financial Economics", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
    // Total = 15
  ],
  "Semester 6": [
    { id: "01:640:421", name: "Advanced Calculus for Engineering", credits: 3 },
    { id: "01:640:411", name: "Mathematical Analysis I", credits: 3 },
    { id: "01:220:414", name: "Economics of Capital Markets", credits: 3 },
    { id: "01:220:415", name: "Portfolio Theory", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
    // Total = 15
  ],
  "Semester 7": [
    { id: "01:640:412", name: "Mathematical Analysis II", credits: 3 },
    { id: "01:640:373", name: "Numerical Analysis I", credits: 3 },
    { id: "01:220:420", name: "Computational Methods (Econ)", credits: 3 },
    { id: "01:220:433", name: "Health Economics", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
    // Total = 15
  ],
  "Semester 8": [
    { id: "01:640:454", name: "Combinatorics", credits: 3 },
    { id: "01:640:489", name: "Computational Finance", credits: 3 },
    { id: "01:220:424", name: "Advanced Analytics for Econ", credits: 3 },
    { id: "01:220:432", name: "Environmental Economics", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
    // Total = 15
  ]
};

// PLAN B
const planB = {
  // === Keep Semester 1 from CompletedClasses.json ===
  "Semester 1": [
    { id: "01:640:250", name: "Introductory Linear Algebra", credits: 3 },
    { id: "01:830:321", name: "SOCIAL PSYCHOLOGY", credits: 3 },
    { id: "01:940:132", name: "Intermediate Spanish", credits: 4 },
    { id: "01:090:125", name: "Honors College Forum", credits: 3 },
    { id: "01:090:103", name: "CROSS-CULTURAL COMPETENCY", credits: 1 }
    // Total = 14
  ],

  // === Keep Semester 2 from CompletedClasses.json ===
  "Semester 2": [
    { id: "07:965:211", name: "Theater Appreciation: Experiences in Contemporary Theater", credits: 3 },
    { id: "01:830:340", name: "PSYCHOPATHOLOGY", credits: 3 },
    { id: "01:730:104", name: "Intro to Philosophy - Writing Intensive", credits: 4 },
    { id: "01:640:300", name: "Intro to Mathematical Reasoning", credits: 3 },
    { id: "01:640:251", name: "Multivariable Calculus", credits: 4 },
    { id: "01:220:102", name: "Intro to Microeconomics", credits: 3 }
    // Total ~ 20
  ],

  // === Fill Semesters 3–8 differently (approx. 15–16 credits each) ===
  "Semester 3": [
    { id: "01:640:252", name: "Elementary Differential Equations", credits: 3 },
    { id: "01:220:103", name: "Intro to Macroeconomics", credits: 3 },
    { id: "01:355:202", name: "Technical Writing Essentials", credits: 3 },
    { id: "01:640:311", name: "Intro to Real Analysis I", credits: 4 },
    { id: "00:000:000", name: "Elective of Choice", credits: 2 }
    // Total = 15
  ],
  "Semester 4": [
    { id: "01:640:350", name: "Linear Algebra", credits: 3 },
    { id: "01:220:412", name: "Monetary Theory & Policy", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 },
    { id: "01:640:312", name: "Intro to Real Analysis II", credits: 3 },
    { id: "37:575:202", name: "History of Labor and Work in the U.S. 1880 to 1945", credits: 3 }
    // Total = 15
  ],
  "Semester 5": [
    { id: "01:640:356", name: "Theory of Numbers", credits: 3 },
    { id: "01:640:361", name: "Set Theory", credits: 3 },
    { id: "01:220:413", name: "Financial Economics", credits: 3 },
    { id: "01:220:410", name: "Advanced Macroeconomic Theory", credits: 3 },
    { id: "01:220:414", name: "Economics of Capital Markets", credits: 3 }
    // Total = 15
  ],
  "Semester 6": [
    { id: "01:640:489", name: "Computational Finance", credits: 3 },
    { id: "01:640:411", name: "Mathematical Analysis I", credits: 3 },
    { id: "01:220:415", name: "Portfolio Theory", credits: 3 },
    { id: "01:220:420", name: "Computational Methods (Econ)", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
    // Total = 15
  ],
  "Semester 7": [
    { id: "01:640:412", name: "Mathematical Analysis II", credits: 3 },
    { id: "01:640:373", name: "Numerical Analysis I", credits: 3 },
    { id: "01:220:421", name: "Econ Forecasting & Big Data", credits: 3 },
    { id: "01:640:454", name: "Combinatorics", credits: 3 },
    { id: "01:640:421", name: "Advanced Calc for Engineering", credits: 3 }
    // Total = 15
  ],
  "Semester 8": [
    { id: "01:220:424", name: "Advanced Analytics for Econ", credits: 3 },
    { id: "01:220:432", name: "Environmental Economics", credits: 3 },
    { id: "01:220:480", name: "Behavioral & Experimental Econ", credits: 3 },
    { id: "00:000:000", name: "Elective of Choice", credits: 3 }
    // Total = 15
  ]
};


function HardcodedAcademicPlanGenerator() {
  const [planIndex, setPlanIndex] = useState(-1); 
  // planIndex = -1 => no plan generated yet
  //             0 => plan A
  //             1 => plan B

  const [loading, setLoading] = useState(false);

  // Decide which plan to display based on planIndex
  let planToShow = null;
  if (planIndex === 0) {
    planToShow = planA;
  } else if (planIndex === 1) {
    planToShow = planB;
  }

  // On button click, simulate 1-second load, then toggle between -1 => 0 => 1 => 0 => ...
  const handleGeneratePlan = () => {
    setLoading(true);
    setTimeout(() => {
      let newIndex;
      if (planIndex === -1) {
        // no plan yet, show Plan A next
        newIndex = 0;
      } else if (planIndex === 0) {
        // was Plan A, show Plan B next
        newIndex = 1;
      } else {
        // was Plan B, go back to Plan A
        newIndex = 0;
      }

      setPlanIndex(newIndex);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="hardcoded-plan-generator">
      <div className="generate-plan-section">
        <h1>Academic Plan Generator</h1>
        <p>
          Click <strong>Generate Plan</strong> to see a sample 8-semester
          schedule that completes all your major/minor requirements!
        </p>

        <button
          className="generate-button"
          onClick={handleGeneratePlan}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>

        {/* If no plan is generated yet, show a message */}
        {planIndex === -1 && !loading && (
          <div className="no-plan">No plan generated yet.</div>
        )}

        {/* If planIndex is 0 or 1, show that plan */}
        {planToShow && !loading && (
          <div className="plan-display">
            {Object.keys(planToShow)
              .sort((a, b) => {
                // numeric sort by semester number
                const semA = parseInt(a.split(" ")[1], 10);
                const semB = parseInt(b.split(" ")[1], 10);
                return semA - semB;
              })
              .map((semesterKey) => (
                <div key={semesterKey} className="semester-block">
                  <h3>{semesterKey}</h3>
                  {planToShow[semesterKey].length > 0 ? (
                    <ul>
                      {planToShow[semesterKey].map((course, idx) => (
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
    </div>
  );
}

export default HardcodedAcademicPlanGenerator;
