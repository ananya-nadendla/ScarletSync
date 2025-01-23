import React, { useState } from "react";
import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // New state for first name
  const [lastName, setLastName] = useState("");   // New state for last name
  const [username, setUsername] = useState("");   // New state for username
  const [error, setError] = useState("");
  const navigate = useNavigate(); // For navigation

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

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
    <div>
      <form onSubmit={handleSignup}>
        <h1>Sign Up</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
    </div>
  );
};

export default Signup;
