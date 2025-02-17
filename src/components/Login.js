import React, { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginAndSignup.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.emailVerified) {
          navigate("/profile");
        } else {
          setError("Please verify your email before logging in.");
          auth.signOut();
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
        setUser(currentUser);
        navigate("/profile");
      } else {
        setError("Please verify your email before logging in.");
        auth.signOut();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src="/logo.png" alt="Scarlet Sync Logo" className="login-logo" />
        <h1 className="login-title">Scarlet Sync</h1>
        <p className="login-subtitle">Connect, Engage, Succeed.</p>
      </div>

      <div className="login-right">
        {!user ? (
          <form onSubmit={handleLogin} className="login-form">
            <h1 className="login-heading">Log in</h1>
            {error && <p className="login-error">{error}</p>}

            {/* Email Field with Visible Label */}
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

            {/* Password Field with Visible Label */}
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

            <button type="submit" className="login-button">Log in</button>

            <p className="login-text">
              Forgot your password?{" "}
              <Link to="/reset-password" className="login-link">Click here to reset it.</Link>
            </p>
            <p className="login-text">
              Don't have an account?{" "}
              <Link to="/signup" className="login-link">Sign Up!</Link>
            </p>
          </form>
        ) : (
          <div>
            <h1>Logging in...</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
