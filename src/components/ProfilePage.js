import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Import Firestore and Auth
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import Popup from './Popup'; // Import Popup component
import '../styles/ProfilePage.css'; // Add your custom CSS file for styling
import Loading from './Loading';

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

  const [friendCount, setFriendCount] = useState(0); // State for friend count
  const [friendsList, setFriendsList] = useState([]); // State for the list of friends
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to handle popup visibility
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

            // Fetch the friend's list and update it dynamically
            const friends = data.friends || [];
            const friendUsernames = [];
            for (const friendUid of friends) {
              const friendDoc = await getDoc(doc(db, "profiles", friendUid));
              if (friendDoc.exists()) {
                friendUsernames.push(friendDoc.data().username);
              }
            }
            setFriendCount(friendUsernames.length); // Update the friend count
            setFriendsList(friendUsernames); // Set the list of friend usernames
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

  useEffect(() => {
    const removeDeletedFriends = async () => {
      if (user) {
        try {
          const userProfileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (userProfileDoc.exists()) {
            const friends = userProfileDoc.data().friends || [];
            const validFriends = [];
            for (const friendUid of friends) {
              const friendDoc = await getDoc(doc(db, "profiles", friendUid));
              if (friendDoc.exists()) {
                validFriends.push(friendUid);
              }
            }
            // Update friends list if it has changed
            if (validFriends.length !== friends.length) {
              setFriendCount(validFriends.length);
              const validUsernames = [];
              for (const validUid of validFriends) {
                const validDoc = await getDoc(doc(db, "profiles", validUid));
                if (validDoc.exists()) {
                  validUsernames.push(validDoc.data().username);
                }
              }
              setFriendsList(validUsernames);
            }
          }
        } catch (err) {
          console.error("Error updating friends list:", err);
        }
      }
    };

    removeDeletedFriends();
  }, [user]);

  const handlePopupClose = () => {
    setIsPopupOpen(false); // Close the popup
  };

  const handleFriendCountClick = () => {
    setIsPopupOpen(true); // Open the popup when friend count is clicked
  };

  if (loading) {
    return <Loading message="Fetching user profile..." />;
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

          {/* Friend count - clickable */}
          <div className="friend-count" onClick={handleFriendCountClick}>
            <span>{friendCount} {friendCount === 1 ? "friend" : "friends"}</span>
          </div>
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

      {/* Popup for displaying the list of friends */}
      {isPopupOpen && (
        <Popup
          title="Friends List"
          content={
            <ul>
              {friendsList.length > 0 ? (
                friendsList.map((username, index) => (
                  <li key={index}>
                    <Link to={`/profile/${username}`}>{username}</Link>
                  </li>
                ))
              ) : (
                <p>No friends to display.</p>
              )}
            </ul>
          }
          onConfirm={handlePopupClose}
          confirmButtonText="Close"
        />
      )}
    </div>
  );
};

export default ProfilePage;
