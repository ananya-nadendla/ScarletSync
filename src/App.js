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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
