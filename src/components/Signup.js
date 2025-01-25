import React, { useState } from "react";
import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/LoginAndSignup.css"; // Shared CSS file for Login and Signup

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // New state for first name
  const [lastName, setLastName] = useState("");   // New state for last name
  const [username, setUsername] = useState("");   // New state for username
  const [error, setError] = useState("");
  const navigate = useNavigate(); // For navigation

  // Regular expression to check if the username contains invalid characters
  // Regular expression to check if the username contains invalid characters
  const isValidUsername = (username) => {
    const allowedChars = /^[a-zA-Z0-9._]+$/; // Only letters, numbers, period (.), and underscore (_)
    return allowedChars.test(username);
  };



  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Check if the username contains only allowed characters
    if (!isValidUsername(username)) {
      setError("Username can only contain letters, numbers, periods (.), and underscores (_).");
      return;
    }

    try {
      // Check if the username already exists
      const q = query(collection(db, "profiles"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Username already exists
        setError("Username is already taken. Please choose another one.");
        return;
      }

      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user information to Firestore
      await setDoc(doc(db, "profiles", user.uid), {
        firstName,
        lastName,
        username,
        email,
      });

      // Send the email verification
      await sendEmailVerification(user);

      // Inform the user to check their email
      alert("Verification email sent! Please check your inbox to verify your email.");

      // Log out the user
      await signOut(auth);

      // Navigate to the login page after logging out
      navigate("/login"); // Redirect to login page
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSignup} className="login-form">
        <h1 className="login-heading">Sign Up</h1>
        {error && <p className="login-error">{error}</p>}
        <div className="login-input-group">
          <label className="login-label">First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="login-input"
            required
          />
        </div>
        <div className="login-input-group">
          <label className="login-label">Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="login-input"
            required
          />
        </div>
        <div className="login-input-group">
          <label className="login-label">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />
        </div>
        <div className="login-input-group">
          <label className="login-label">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />
        </div>
        <div className="login-input-group">
          <label className="login-label">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
        </div>
        <button type="submit" className="login-button">Sign Up</button>
        <p className="login-text">
          Already have an account?{" "}
          <a href="/login" className="login-link">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
