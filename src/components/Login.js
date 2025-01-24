import React, { useState, useEffect } from "react";
import { auth } from "../config/firebase"; // Adjust the path as needed
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import "../styles/LoginAndSignup.css"; // Import the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // useNavigate hook

  useEffect(() => {
    // Check if the user is already authenticated
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If the user is authenticated, check if the email is verified
        if (currentUser.emailVerified) {
          navigate("/dashboard"); // Redirect to dashboard if email is verified
        } else {
          setError("Please verify your email before logging in.");
          auth.signOut(); // Log out the user if their email is not verified
        }
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      if (currentUser.emailVerified) {
        setUser(currentUser); // Set the user state before navigating
        navigate("/dashboard"); // Navigate to dashboard after successful login
      } else {
        setError("Please verify your email before logging in.");
        auth.signOut(); // Log out the user if their email is not verified
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      {!user ? (
        <form onSubmit={handleLogin} className="login-form">
          <h1 className="login-heading">Login</h1>
          {error && <p className="login-error">{error}</p>}
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
          <button type="submit" className="login-button">Login</button>
          <p className="login-text">
            Forgot your password?{" "}
            <Link to="/reset-password" className="login-link">Click here to reset it.</Link>
          </p>
          <p className="login-text">
            Don't have an account?{" "}
            <Link to="/signup" className="login-link">Sign up!</Link>
          </p>
        </form>
      ) : (
        <div>
          <h1>Logging in...</h1>
        </div>
      )}
    </div>
  );
};

export default Login;
