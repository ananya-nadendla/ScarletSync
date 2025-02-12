import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Import your Firebase auth instance
import "../styles/Sidebar.css"; // Dedicated CSS for the layout and side panel
import { useStreamChat } from "../context/StreamChatContext";

const Sidebar = () => {
  const navigate = useNavigate();
    const { client } = useStreamChat();

    const handleLogout = async () => {
      try {
        if (client) {
          await client.disconnectUser(); // Wait for disconnect to complete
        }

        await signOut(auth);
        navigate("/login"); // Redirect to login after logout
      } catch (err) {
        console.error("Error logging out:", err.message);
      }
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
          <li>
            <NavLink to="/friends" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              Friends
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/chatbot" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              AI Advisor
            </NavLink>
          </li>
          <li>
            <NavLink to="/groupchat" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              Chats
            </NavLink>
          </li>
          <li>
            <NavLink to="/academic-plan" className="sidebar-menu-link" activeClassName="sidebar-active-link">
              Academic Planner
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
