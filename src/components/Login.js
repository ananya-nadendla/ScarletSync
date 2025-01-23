import React, { useState, useEffect } from "react";
import { auth } from "../config/firebase"; // Adjust the path as needed
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // useNavigate hook

  useEffect(() => {
    // Check if the user is already authenticated (if you want to keep them logged in)
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigate("/dashboard"); // Redirect to dashboard if already logged in
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user); // Set the user state before navigating
      navigate("/dashboard"); // Navigate to dashboard after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {!user ? (
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
      ) : (
        <div>
          <h1>Logging in...</h1> {/* Optional: display a loading state */}
        </div>
      )}
    </div>
  );
};

export default Login;
