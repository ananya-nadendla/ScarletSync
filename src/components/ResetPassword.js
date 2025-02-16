import React, { useState } from "react";
import { auth } from "../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/LoginAndSignup.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent. Please check your inbox.");
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-left">
        <img src="/logo.png" alt="Scarlet Sync Logo" className="login-logo" />
        <h1 className="login-title">Scarlet Sync</h1>
        <p className="login-subtitle">Connect, Engage, Succeed.</p>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="login-right">
        <form onSubmit={handleResetPassword} className="login-form">
          <h1 className="login-heading">Reset Password</h1>
          {successMessage && <p className="login-success">{successMessage}</p>}
          {error && <p className="login-error">{error}</p>}

          {/* Email Input */}
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

          <button type="submit" className="login-button">Reset Password</button>

          <p className="login-text">
            Remember your password?{" "}
            <a className="login-link" href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
