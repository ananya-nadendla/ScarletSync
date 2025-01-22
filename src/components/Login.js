import React, { useState } from "react";
import { auth } from "../config/firebase"; // Adjust the path as needed
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // useNavigate hook

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null); // Clear the user state
      navigate("/login"); // Redirect to the login page after logging out
    }).catch((err) => {
      console.error("Error logging out:", err.message);
    });
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.email}!</h1>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>

          {/* Forgot password link */}
          <p>
            Forgot your password?{" "}
            <Link to="/reset-password">Click here to reset it.</Link>
          </p>

          {/* Sign up link */}
          <p>
            Don't have an account?{" "}
            <Link to="/signup">Sign up!</Link> {/* Link to the sign-up page */}
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
