import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Import Firestore and Auth
import { doc, setDoc, getDoc } from "firebase/firestore"; // Firestore functions
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = auth.currentUser; // Get the current user from Firebase auth

  // Fetch existing profile data
  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect if no user is found
      return;
    }

    const fetchProfile = async () => {
      try {
        const userProfileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (userProfileDoc.exists()) {
          const data = userProfileDoc.data();
          setNickname(data.nickname || "");
          setUsername(data.username || "");
          setBio(data.bio || "");
        }
      } catch (err) {
        setError("Error fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (user) {
      try {
        // Save the profile data to Firestore
        await setDoc(doc(db, "profiles", user.uid), {
          nickname,
          username,
          bio,
        });
        alert("Profile updated!");
      } catch (err) {
        setError("Error saving profile data.");
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Display loading state while user data is being fetched
  }

  return (
    <div>
      <h1>User Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nickname:</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
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
          <label>Bio:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
          />
        </div>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;
