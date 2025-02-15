import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Import your Firebase auth instance
import "../styles/Sidebar.css"; // Dedicated CSS for the layout and side panel
import { useStreamChat } from "../context/StreamChatContext";
// Import FontAwesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHome, faCog, faComment, faRobot, faSignOutAlt, faBell, faUsers } from "@fortawesome/free-solid-svg-icons";

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
             <FontAwesomeIcon icon={faHome} />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/friends" className="sidebar-menu-link" activeClassName="sidebar-active-link">
            <FontAwesomeIcon icon={faUsers} />
              Friends
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className="sidebar-menu-link" activeClassName="sidebar-active-link">
            <FontAwesomeIcon icon={faUser} />
              ‎  Profile
            </NavLink> {/*LRM Is a blank space*/}
          </li>
          <li>
            <NavLink to="/chatbot" className="sidebar-menu-link" activeClassName="sidebar-active-link">
            <FontAwesomeIcon icon={faRobot} />
              AI Advisor
            </NavLink>
          </li>
          <li>
            <NavLink to="/groupchat" className="sidebar-menu-link" activeClassName="sidebar-active-link">
            <FontAwesomeIcon icon={faComment} />
              Messages
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className="sidebar-menu-link" activeClassName="sidebar-active-link">
            <FontAwesomeIcon icon={faCog} />
              Settings
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout} className="sidebar-menu-link sidebar-logout-btn">
            <FontAwesomeIcon icon={faSignOutAlt} />
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
