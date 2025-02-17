import React from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css"; // Import the CSS file

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Left Side - ScarletSync Logo */}
      <div className="landing-left">
        <img src="/logo.png" alt="Scarlet Sync Logo" className="landing-logo" />
        <h1 className="landing-title">Scarlet Sync</h1>
        <p className="landing-subtitle">Connect, Engage, Succeed.</p>
      </div>

      {/* Right Side - Login and Signup */}
      <div className="landing-right">
        <img src="/rutgers-r.png" alt="Rutgers R" className="rutgers-logo" />
        <p className="landing-text">
          <strong>Sign Up</strong> or <strong>Log In</strong> to start connecting with other Rutgers students and take control of your academic journey.
        </p>
        <div className="landing-buttons">
          <Link to="/signup">
            <button className="landing-btn">Sign Up</button>
          </Link>
          <Link to="/login">
            <button className="landing-btn">Log in</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
