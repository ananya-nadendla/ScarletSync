import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Import your Firebase auth instance
import "../styles/Sidebar.css"; // Dedicated CSS for the layout and side panel
import { useStreamChat } from "../context/StreamChatContext";
// Import FontAwesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHome, faCog, faComment, faRobot, faSignOutAlt, faBell, faUsers, faStar, faCalendarDays } from "@fortawesome/free-solid-svg-icons";

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
          {/* Logo Section */}
          <div className="sidebar-logo-container">
            <img src="/logo.png" alt="ScarletSync Logo" className="sidebar-logo" />
            <h2 className="sidebar-title">ScarletSync</h2>
          </div>

          {/* Sidebar Menu */}
          <ul className="sidebar-menu-options">
            <li>
              <NavLink to="/profile" className="sidebar-menu-link" activeClassName="sidebar-active-link">
                <FontAwesomeIcon icon={faUser} />
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink to="/friends" className="sidebar-menu-link" activeClassName="sidebar-active-link">
                <FontAwesomeIcon icon={faUsers} />
                Friends
              </NavLink>
            </li>
            <li>
                          <NavLink to="/groupchat" className="sidebar-menu-link" activeClassName="sidebar-active-link">
                            <FontAwesomeIcon icon={faComment} />
                            Chats
                          </NavLink>
                        </li>

            <li>
              <NavLink to="/academic-plan" className="sidebar-menu-link" activeClassName="sidebar-active-link">
                <FontAwesomeIcon icon={faCalendarDays} />
                Academic Planner
              </NavLink>
            </li>
            <li>
              <NavLink to="/chatbot" className="sidebar-menu-link" activeClassName="sidebar-active-link">
                <FontAwesomeIcon icon={faRobot} />
                AI Advisor
              </NavLink>
            </li>

            <li>
                                      <NavLink to="/points" className="sidebar-menu-link" activeClassName="sidebar-active-link">
                                        <FontAwesomeIcon icon={faStar} />
                                        Points
                                      </NavLink>
                                    </li>


            <li>
              <NavLink to="/settings" className="sidebar-menu-link" activeClassName="sidebar-active-link">
                <FontAwesomeIcon icon={faCog} />
                Settings
              </NavLink>
            </li>

          </ul>

          {/* Logout Button */}
          <button onClick={handleLogout} className="sidebar-menu-link sidebar-logout-btn">

            Log Out
          </button>
        </nav>

        {/* Main Content */}
        <main className="sidebar-main-content">
          <Outlet />
        </main>
      </div>
    );
  };

  export default Sidebar;