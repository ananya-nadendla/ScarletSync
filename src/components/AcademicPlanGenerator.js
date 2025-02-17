// src/components/AcademicPlanGenerator.js

import React, { useState } from "react";
import { generateAcademicPlan } from "../util/academicPlanUtil"; 
// Make sure your file path to academicPlanUtil.js is correct

function AcademicPlanGenerator() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler to generate the plan
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
    <div style={{ margin: "1rem" }}>
      <h1>Academic Plan Generator</h1>
      <p>Click "Generate Plan" to run the solver with your current constraints.</p>
      <button onClick={handleGeneratePlan} disabled={loading}>
        {loading ? "Generating..." : "Generate Plan"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {plan && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Your Plan</h2>
          {Object.keys(plan)
            .sort((a, b) => {
              // optional numeric sort if keys are "Semester 1", "Semester 2", etc.
              const semA = parseInt(a.split(" ")[1], 10);
              const semB = parseInt(b.split(" ")[1], 10);
              return semA - semB;
            })
            .map((semesterKey) => (
              <div key={semesterKey} style={{ marginBottom: "1rem" }}>
                <h3>{semesterKey}</h3>
                {plan[semesterKey].length > 0 ? (
                  <ul>
                    {plan[semesterKey].map((course) => (
                      <li key={course.id}>
                        {course.name} ({course.id}), {course.credits} credits
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

export default AcademicPlanGenerator;
