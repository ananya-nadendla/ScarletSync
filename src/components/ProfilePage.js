import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Import Firestore and Auth
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    schoolYear: "",
    major: "",
    minor: "",
    campusLocation: "",
    selectedSubInterests: [], // Initialize as an empty array
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const userProfileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (userProfileDoc.exists()) {
            setProfileData({
              ...userProfileDoc.data(),
              selectedSubInterests: userProfileDoc.data().selectedSubInterests || [], // Default to an empty array
            });
          }
        } else {
          navigate("/login");
        }
      } catch (err) {
        setError("Error fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>First Name:</label>
        <p>{profileData.firstName || "No first name set"}</p>
      </div>
      <div>
        <label>Last Name:</label>
        <p>{profileData.lastName || "No last name set"}</p>
      </div>
      <div>
        <label>Username:</label>
        <p>{profileData.username || "No username set"}</p>
      </div>
      <div>
        <label>Bio:</label>
        <p>{profileData.bio || "No bio set"}</p>
      </div>
      <div>
        <label>School Year:</label>
        <p>{profileData.schoolYear || "No school year set"}</p>
      </div>
      <div>
        <label>Major:</label>
        <p>{profileData.major || "No major set"}</p>
      </div>
      <div>
        <label>Minor:</label>
        <p>{profileData.minor || "No minor set"}</p>
      </div>
      <div>
        <label>Campus Location:</label>
        <p>{profileData.campusLocation || "No campus location set"}</p>
      </div>
      <div>
        <label>Interests:</label>
        {profileData.selectedSubInterests.length > 0 ? (
          <ul>
            {profileData.selectedSubInterests.map((subInterest, index) => (
              <li key={index}>{subInterest}</li>
            ))}
          </ul>
        ) : (
          <p>No interests selected</p>
        )}
      </div>

      <button onClick={() => navigate("/settings")}>Edit Profile</button>
    </div>
  );
};

export default ProfilePage;
