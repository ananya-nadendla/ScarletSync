import React, { useState } from "react";
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // For navigation

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser(user);

      // Send the email verification
      await sendEmailVerification(user);

      // Inform the user to check their email
      alert("Verification email sent! Please check your inbox to verify your email.");

      // Navigate to login page after successful signup
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.email}!</h1>
          <button onClick={() => auth.signOut()}>Log Out</button>
        </div>
      ) : (
        <form onSubmit={handleSignup}>
          <h1>Sign Up</h1>
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
          <button type="submit">Sign Up</button>

          <p>
            Already have an account?{" "}
            <a href="/login">Login</a>
          </p>
        </form>
      )}
    </div>
  );
};

export default Signup;
