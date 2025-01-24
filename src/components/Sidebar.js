import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../styles/Sidebar.css"; // Dedicated CSS for the layout and side panel

const Layout = () => {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <nav className="side-panel">
        <h2 className="side-panel-logo">ScarletSync</h2>
        <ul className="menu-options">
          <li>
            <NavLink to="/dashboard" className="menu-link" activeClassName="active-link">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className="menu-link" activeClassName="active-link">
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className="menu-link" activeClassName="active-link">
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink to="/logout" className="menu-link" activeClassName="active-link">
              Log Out
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="main-content">
        <Outlet /> {/* This renders the content of the current route */}
      </main>
    </div>
  );
};

export default Layout;
