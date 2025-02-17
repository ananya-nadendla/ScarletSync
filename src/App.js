import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import PageNotFound from "./components/PageNotFound";
import Loading from "./components/Loading";
import FriendsPage from "./components/FriendsPage";
import Chatbot from "./components/Chatbot";
import GroupChat from "./components/GroupChat";
import { StreamChatProvider } from "./context/StreamChatContext"; // Import the StreamChatProvider
import AcademicPlanGenerator from "./components/AcademicPlanGenerator";
import HardcodedAcademicPlanGenerator from "./HardcodedAcademicPlanGenerator";


// If user is not logged in and tries to access dashboard, profile, etc, REDIRECT to login
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Add a loading state for authentication
  const [profileData, setProfileData] = useState(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Update user state on login/logout
      setLoadingAuth(false); // Auth status is determined
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  if (loadingAuth) {
    return <Loading message="Loading..." />; // Show a loading screen while checking authentication
  }

  return (
    <StreamChatProvider>
      <Router>
        <PageLogger user={user} /> {/* TEMPORARY DEBUGGER to log user authentication status */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />


          {/* Protected routes --> User must be logged in to access these pages*/}
          <Route element={<Sidebar />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute user={user}>
                  <OtherUserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute user={user}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute user={user}>
                  <FriendsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute user={user}>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groupchat"
              element={
                <ProtectedRoute user={user}>
                  <GroupChat userId={user?.uid} /> {/* Pass userId from the logged-in user */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/academic-plan"
              element={
                <ProtectedRoute user={user}>
                  {/* Pass the studentProfile. For example, profileData obtained from Firebase */}
                  <HardcodedAcademicPlanGenerator studentProfile={profileData}/>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </StreamChatProvider>
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
