import React, { useState } from "react";
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup"; // Assuming Popup is in the components folder
import "../styles/LoginAndSignup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State for showing the popup
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

      setShowPopup(true); // Show the popup

      // Log out the user
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false); // Close the popup
    navigate("/login"); // Redirect to login page
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
      {showPopup && (
        <Popup
          title="Email Verification Sent"
          content="A verification email has been sent to your email address. Please check your inbox and verify your email."
          onClose={handlePopupClose}
          closeButtonText="OK"
        />
      )}

    </div>
  );
};

export default Signup;
