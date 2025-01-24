import React, { useState, useEffect } from "react";
import { db } from "../config/firebase"; // Import Firestore
import { collection, query, where, getDocs } from "firebase/firestore"; // Firestore query functions
import { useParams, useNavigate } from "react-router-dom"; // To access the username from the URL and navigate
import { auth } from "../config/firebase"; // Import Firebase auth

const OtherUserProfile = () => {
  const { username } = useParams(); // Get the username from the URL
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook to navigate programmatically
  const currentUser = auth.currentUser; // Get the current logged-in user

  useEffect(() => {
    // If the user tries to visit their own profile, redirect to /profile
    if (currentUser && username === currentUser.displayName) {
      navigate("/profile"); // Redirect to the logged-in user's profile
    } else {
      // Otherwise, fetch the other user's profile
      const fetchProfile = async () => {
        try {
          // Query the profiles collection to find a document where username matches
          const profilesRef = collection(db, "profiles");
          const q = query(profilesRef, where("username", "==", username));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            setError("Profile not found.");
          } else {
            // Assuming there will only be one document with the matching username
            querySnapshot.forEach((doc) => {
              setProfileData(doc.data()); // Set the profile data from the query result
            });
          }
        } catch (err) {
          setError("Error fetching profile data.");
        }
      };

      fetchProfile();
    }
  }, [username, currentUser, navigate]); // Re-run when username or currentUser changes

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profileData) {
    return <p>Loading...</p>;
  }

  // Add safety checks to prevent errors due to undefined fields
  const major = profileData.major || [];
  const minor = profileData.minor || [];
  const selectedSubInterests = profileData.selectedSubInterests || [];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpPPrc8VMEPWqvFtOIxFZLDCN4JITg01d-KA&s"
            alt="Profile"
          />
        </div>
        <div className="profile-info">
          <h1>{profileData.firstName} {profileData.lastName}</h1>
          <h3>@{profileData.username}</h3>
          <p>{profileData.bio || "No bio set"}</p>
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-item">
          <label>School Year:</label>
          <p>{profileData.schoolYear || "No school year set"}</p>
        </div>
        <div className="profile-item">
          <label>Major:</label>
          {major.length > 0 ? (
            <div className="chips-container">
              {major.map((major, index) => (
                <span key={index} className="chip">{major}</span>
              ))}
            </div>
          ) : (
            <p>No major set</p>
          )}
        </div>

        <div className="profile-item">
          <label>Minor:</label>
          {minor.length > 0 ? (
            <div className="chips-container">
              {minor.map((minor, index) => (
                <span key={index} className="chip">{minor}</span>
              ))}
            </div>
          ) : (
            <p>No minor set</p>
          )}
        </div>

        <div className="profile-item">
          <label>Campus Location:</label>
          <p>{profileData.campusLocation || "No campus location set"}</p>
        </div>
        <div className="profile-item">
          <label>Interests:</label>
          {selectedSubInterests.length > 0 ? (
            <div className="chips-container">
              {selectedSubInterests.map((subInterest, index) => (
                <span key={index} className="chip">{subInterest}</span>
              ))}
            </div>
          ) : (
            <p>No interests selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherUserProfile;
