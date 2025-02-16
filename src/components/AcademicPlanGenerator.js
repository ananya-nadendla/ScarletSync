// src/components/AcademicPlanGenerator.js

import React, { useState } from "react";
import { generateAcademicPlan } from "../util/academicPlanUtil";
import "../styles/AcademicPlanGenerator.css";

const AcademicPlanGenerator = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError("");
    try {
      const generatedPlan = await generateAcademicPlan();
      setPlan(generatedPlan);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="academic-plan-generator">
      <h1>Academic Plan Generator</h1>
      <p>
        Generate your personalized academic plan to finish all your requirements
        for your majors/minors!
      </p>
      <button onClick={handleGeneratePlan} disabled={loading}>
        {loading ? "Generating Plan..." : "Generate Plan"}
      </button>
      {error && <div className="error-message">{error}</div>}
      {plan && (
        <div className="plan-display">
          <h2>Your 4-Year Plan</h2>
          {Object.keys(plan).map((semesterKey) => (
            <div key={semesterKey} className="semester-block">
              <h3>{semesterKey}</h3>
              {plan[semesterKey].length > 0 ? (
                <ul>
                  {plan[semesterKey].map((courseId) => (
                    <li key={courseId}>{courseId}</li>
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
};

export default AcademicPlanGenerator;
