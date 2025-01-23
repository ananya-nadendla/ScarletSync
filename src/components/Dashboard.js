import React from "react";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../config/firebase"; // Ensure auth is imported

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
    <div>
      <h1>Welcome to your Dashboard!</h1>
      <div>
        <Link to="/profile">
          <button>Go to Profile</button>
        </Link>
      </div>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Dashboard;
