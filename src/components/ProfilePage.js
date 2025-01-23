import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Import Firestore and Auth
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { useNavigate } from "react-router-dom";
import '../styles/ProfilePage.css'; // Add your custom CSS file for styling

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    schoolYear: "",
    major: [], // Changed from string to array
    minor: [],
    campusLocation: "",
    selectedSubInterests: [], // Ensure it's always an array
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
            const data = userProfileDoc.data();
            setProfileData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              username: data.username || "",
              bio: data.bio || "",
              schoolYear: data.schoolYear || "",
              major: Array.isArray(data.major) ? data.major : [], // Ensure it's an array
              minor: Array.isArray(data.minor) ? data.minor : [], // Ensure it's an array
              campusLocation: data.campusLocation || "",
              selectedSubInterests: Array.isArray(data.selectedSubInterests) ? data.selectedSubInterests : [], // Ensure it's an array
            });
          } else {
            setError("Profile not found.");
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
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>} {/* Display error if exists */}

      <div className="profile-header">
        <div className="profile-picture">
          {/* Add a profile picture or placeholder */}
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpPPrc8VMEPWqvFtOIxFZLDCN4JITg01d-KA&s" alt="Profile" />
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

      <div className="edit-profile-btn">
        <button onClick={() => navigate("/settings")}>Edit Profile</button>
      </div>
    </div>
  );
};

export default ProfilePage;
