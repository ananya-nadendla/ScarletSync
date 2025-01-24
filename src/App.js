import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { auth, db } from "./config/firebase"; // Import Firebase auth and Firestore
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; // Firestore functions
import Login from "./components/Login";
import Signup from "./components/Signup";
import ResetPassword from "./components/ResetPassword";
import LandingPage from "./components/LandingPage";
import ProfilePage from "./components/ProfilePage";
import Dashboard from "./components/Dashboard";
import SettingsPage from "./components/SettingsPage";
import Sidebar from "./components/Sidebar";
import OtherUserProfile from "./components/OtherUserProfile";

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

      <PageLogger user={user} /> {/*TEMPORARY DEBUGGER to log user authentication status*/}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes -- can only access these if user is logged in */}
        {user && (
          <Route element={<Sidebar />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile/:username" element={<OtherUserProfile />} />
          </Route>
        )}

        {/* Fallback to login -- if user tries to access the 3 website below while logged out*/}
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

// TEMPORARY DEBUG METHOD - Console.logs navigation and authentication status of user
const PageLogger = ({ user }) => {
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    let unsubscribe;

    // Listen for real-time updates to the user's profile in Firestore
    if (user) {
      const userDocRef = doc(db, "profiles", user.uid);
      unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfileData(data); // Update the profile data state
          console.log("Profile updated:", data); // Log the latest profile data
        } else {
          console.log("User profile not found in Firestore.");
          setProfileData(null);
        }
      });
    } else {
      setProfileData(null); // Reset profile data when user logs out
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); // Cleanup Firestore listener on unmount or logout
      }
    };
  }, [user]);

  useEffect(() => {
    // Log navigation and user profile updates
    console.log(`Navigated to ${location.pathname}`);
    if (user) {
      console.log("User is logged in:", {
        uid: user.uid,
        username: profileData?.username || "Loading...",
      });
    } else {
      console.log("User is not logged in");
    }
  }, [location, user, profileData]); // Trigger when location, user, or profileData changes

  return null; // This component doesn't render anything
};

export default App;
