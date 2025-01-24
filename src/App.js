import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./config/firebase"; // Import auth from firebase config
import { onAuthStateChanged } from "firebase/auth"; // Import this method
import Login from "./components/Login";
import Signup from "./components/Signup";
import ResetPassword from "./components/ResetPassword";
import LandingPage from "./components/LandingPage";
import ProfilePage from "./components/ProfilePage";
import Dashboard from "./components/Dashboard";
import SettingsPage from "./components/SettingsPage";
import Sidebar from "./components/Sidebar";
import OtherUserProfile from "./components/OtherUserProfile"; // Import the new component

const App = () => {
  const [user, setUser] = useState(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Update user state on login/logout
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes with sidebar so user can't access these unless logged in */}
        {user && (
          <Route element={<Sidebar />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Dynamic route for viewing other users' profiles based on username */}
            <Route path="/profile/:username" element={<OtherUserProfile />} />
          </Route>
        )}

        {/* Fallback to login if user is not authenticated */}
        {!user && (
          <>
            <Route path="/dashboard" element={<Login />} />
            <Route path="/profile" element={<Login />} />
            <Route path="/settings" element={<Login />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
