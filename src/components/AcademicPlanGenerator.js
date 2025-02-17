import React, { useState } from "react";
import { generateAcademicPlan } from "../util/academicPlanUtil";

const AcademicPlanGenerator = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError("");
    try {
      // generateAcademicPlan no longer needs arguments
      // because we import the data inside it
      const generatedPlan = await generateAcademicPlan();
      setPlan(generatedPlan);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleGeneratePlan} disabled={loading}>
        {loading ? "Generating Plan..." : "Generate Plan"}
      </button>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {plan && (
        <div>
          {Object.keys(plan)
            .sort((a, b) => {
              // optional numeric sort of "Semester 1", "Semester 2", ...
              const semA = parseInt(a.split(" ")[1], 10);
              const semB = parseInt(b.split(" ")[1], 10);
              return semA - semB;
            })
            .map((semesterKey) => (
              <div key={semesterKey}>
                <h3>{semesterKey}</h3>
                {plan[semesterKey].length > 0 ? (
                  <ul>
                    {plan[semesterKey].map((course) => (
                      <li key={course.id}>
                        {course.id} - {course.name} ({course.credits} credits)
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
};

export default AcademicPlanGenerator;
