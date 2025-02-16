import React, { useState } from "react";
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup";
import "../styles/LoginAndSignup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const isValidUsername = (username) => {
    const allowedChars = /^[a-zA-Z0-9._]+$/;
    return allowedChars.test(username);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidUsername(username)) {
      setError("Username can only contain letters, numbers, periods (.), and underscores (_).");
      return;
    }

    try {
      const q = query(collection(db, "profiles"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("Username is already taken. Please choose another one.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "profiles", user.uid), {
        firstName,
        lastName,
        username,
        email,
      });

      await sendEmailVerification(user);

      setShowPopup(true);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/login");
  };

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-left">
        <img src="/logo.png" alt="Scarlet Sync Logo" className="login-logo" />
        <h1 className="login-title">Scarlet Sync</h1>
        <p className="login-subtitle">Connect, Engage, Succeed.</p>
      </div>

      {/* Right Side - Signup Form */}
      <div className="login-right">
        <form onSubmit={handleSignup} className="login-form">
          <h1 className="login-heading">Sign Up</h1>
          {error && <p className="login-error">{error}</p>}

          {/* First Name */}
          <div className="login-input-group">
            <label htmlFor="firstName" className="login-label">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Last Name */}
          <div className="login-input-group">
            <label htmlFor="lastName" className="login-label">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Username */}
          <div className="login-input-group">
            <label htmlFor="username" className="login-label">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Email */}
          <div className="login-input-group">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="Enter your email..."
              required
            />
          </div>

          {/* Password */}
          <div className="login-input-group">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="********"
              required
            />
          </div>

          <button type="submit" className="login-button">Sign Up</button>

          <p className="login-text">
            Already have an account?{" "}
            <a href="/login" className="login-link">Login</a>
          </p>
        </form>

        {/* Popup for Email Verification */}
        {showPopup && (
          <Popup
            title="Email Verification Sent"
            content="A verification email has been sent to your email address. Please check your inbox and verify your email."
            onConfirm={handlePopupClose}
            confirmButtonText="OK"
          />
        )}
      </div>
    </div>
  );
};

export default Signup;
