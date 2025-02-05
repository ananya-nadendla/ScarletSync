import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import Notifications from "../components/Notifications";
import "../styles/FriendsPage.css";


const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [friendRecommendations, setFriendRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);


  useEffect(() => {
    const fetchRecommendations = async () => {
      const recommendations = await getDocs(collection(db, "profiles"));
      setFriendRecommendations(recommendations.docs.map(doc => doc.data()));
    };
    fetchRecommendations();
  }, []);


  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filteredResults = friendRecommendations.filter(profile =>
      profile.username.toLowerCase().startsWith(lowerQuery)
    );
    setSearchResults(filteredResults);
  }, [searchQuery, friendRecommendations]);


  return (
    <div className="friends-page">
      <div className="tabs">
        {["notifications", "recommendations", "search"].map(tab => (
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
            {friendRecommendations.map((profile, index) => (
              <div key={index} className="profile-card">
                <Link to={`/profile/${profile.username}`} className="profile-username">
                  {profile.username}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}


      {activeTab === "search" && (
        <div className="search-tab">
          <h3>Search Profiles</h3>
          <input
            type="text"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map((profile, index) => (
                <div key={index} className="profile-card">
                  <Link to={`/profile/${profile.username}`} className="profile-username">
                    {profile.username}
                  </Link>
                </div>
              ))
            ) : (
              <p>{searchQuery.length > 0 ? "No profiles found" : "Start typing to search for profiles"}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default FriendsPage;
