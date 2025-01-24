import React, { useState } from "react";
import { auth } from "../config/firebase"; // Adjust path if needed
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../styles/LoginAndSignup.css';

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate(); // For navigation

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent. Please check your inbox.");
      setTimeout(() => {
        navigate("/login"); // Redirect back to login after success
      }, 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-heading">Reset Password</h1>
        <form onSubmit={handleResetPassword}>
          <div className="login-input-group">
            <label className="login-label">Email:</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Reset Password</button>
        </form>

        {successMessage && <p className="login-success">{successMessage}</p>}
        {error && <p className="login-error">{error}</p>}

        <p className="login-text">
          Remember your password? <a className="login-link" href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
