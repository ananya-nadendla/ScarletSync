// src/components/LandingPage.js
import React from "react";
import { Link } from "react-router-dom"; // Import Link component from react-router-dom

const LandingPage = () => {
  return (
    <div>
      <h1>Welcome to ScarletSync</h1>
      <p>This is the landing page. [Slogan] Build a strong community at Rutgers!</p>

      {/* Navigation links to login and sign-up pages */}
      <div>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
