// src/components/FriendsPage.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../config/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import Notifications from "../components/Notifications";
import "../styles/FriendsPage.css";
import { getFriendRecommendations } from "../util/friendRecommendationUtil";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [friendRecommendations, setFriendRecommendations] = useState([]);
  const [recommendedFriends, setRecommendedFriends] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Fetch current user's profile
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      const currentUserUid = auth.currentUser?.uid;
      if (currentUserUid) {
        const userDoc = await getDoc(doc(db, "profiles", currentUserUid));
        if (userDoc.exists()) {
          setCurrentUserProfile(userDoc.data());
        }
      }
    };
    fetchCurrentUserProfile();
  }, []);

  // Fetch all profiles from Firestore and include profile images
  useEffect(() => {
    const fetchRecommendations = async () => {
      const recommendationsSnapshot = await getDocs(collection(db, "profiles"));
      const profiles = recommendationsSnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));

      // Fetch profile images for each user
      const profilesWithImages = profiles.map((profile) => ({
        ...profile,
        profileImage:
          profile.profileImage ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpPPrc8VMEPWqvFtOIxFZLDCN4JITg01d-KA&s", // Default image
      }));

      setFriendRecommendations(profilesWithImages);
    };

    fetchRecommendations();
  }, []);

  // Compute friend recommendations
  useEffect(() => {
    const currentUserUid = auth.currentUser?.uid;
    if (currentUserProfile && friendRecommendations.length > 0 && currentUserUid) {
      const recommendations = getFriendRecommendations(
        currentUserUid,
        currentUserProfile,
        friendRecommendations
      );
      setRecommendedFriends(recommendations);
    }
  }, [currentUserProfile, friendRecommendations]);

  // Update search results based on query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filteredResults = friendRecommendations.filter((profile) =>
      profile.username.toLowerCase().startsWith(lowerQuery)
    );
    setSearchResults(filteredResults);
  }, [searchQuery, friendRecommendations]);

  return (
    <div className="friends-page">
      <div className="tabs">
        {["notifications", "recommendations", "search"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "notifications" && <Notifications />}

      {activeTab === "recommendations" && (
        <div className="recommendations-tab">
          <h3>Friend Recommendations</h3>
          <div className="recommendations-list">
            {recommendedFriends.length > 0 ? (
              recommendedFriends.map((profile) => (
                <Link
                  to={`/profile/${profile.username}`}
                  key={profile.id}
                  className="profile-card"
                >
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="profile-picture"
                  />
                  <div className="profile-username">{profile.username}</div>
                </Link>
              ))
            ) : (
              <p>No friend recommendations available.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div className="search-tab">
          <h3>Search Profiles</h3>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search by username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map((profile) => (
                <Link
                  to={`/profile/${profile.username}`}
                  key={profile.id}
                  className="profile-card"
                >
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="profile-picture"
                  />
                  <div className="profile-username">{profile.username}</div>
                </Link>
              ))
            ) : (
              <p>
                {searchQuery.length > 0
                  ? "No profiles found"
                  : "Start typing to search for profiles"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
