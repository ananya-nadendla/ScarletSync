import React from "react";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../config/firebase";
import "../styles/Dashboard.css"; // Import the dedicated CSS for the Dashboard

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login"); // Redirect to login after logout
      })
      .catch((err) => {
        console.error("Error logging out:", err.message);
      });
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">Welcome to your Dashboard!</h1>
      <div className="dashboard-buttons">
        <Link to="/profile">
          <button className="dashboard-button">Go to Profile</button>
        </Link>
        <button className="dashboard-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
