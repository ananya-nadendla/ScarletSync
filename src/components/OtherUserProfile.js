import React, { useState, useEffect } from "react";
import { db } from "../config/firebase"; // Import Firestore
import { collection, query, where, getDocs } from "firebase/firestore"; // Firestore query functions
import { useParams } from "react-router-dom"; // To access the username from the URL

const OtherUserProfile = () => {
  const { username } = useParams(); // Get the username from the URL
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, [username]); // Re-run when the username changes

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profileData) {
    return <p>Loading...</p>;
  }

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
          {profileData.major.length > 0 ? (
            <div className="chips-container">
              {profileData.major.map((major, index) => (
                <span key={index} className="chip">{major}</span>
              ))}
            </div>
          ) : (
            <p>No major set</p>
          )}
        </div>

        <div className="profile-item">
          <label>Minor:</label>
          {profileData.minor.length > 0 ? (
            <div className="chips-container">
              {profileData.minor.map((minor, index) => (
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
          {profileData.selectedSubInterests.length > 0 ? (
            <div className="chips-container">
              {profileData.selectedSubInterests.map((subInterest, index) => (
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
