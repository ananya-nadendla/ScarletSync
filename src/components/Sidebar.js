import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Import your Firebase auth instance
import "../styles/Sidebar.css"; // Dedicated CSS for the layout and side panel

const Sidebar = () => {
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
    <div className="sidebar-layout-container">
      {/* Sidebar */}
      <nav className="sidebar-side-panel">
        <h2 className="sidebar-side-panel-logo">ScarletSync</h2>
        <ul className="sidebar-menu-options">
          <li>
            <NavLink to="/dashboard" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              Dashboard
            </NavLink>
          </li>
            <NavLink to="/notifications" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              Notifications
            </NavLink>
          <li>
            <NavLink to="/profile" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              Settings
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout} className="sidebar-menu-link sidebar-logout-btn">
              Log Out
            </button>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="sidebar-main-content">
        <Outlet /> {/* This renders the content of the current route */}
      </main>
    </div>
  );
};

export default Sidebar;
