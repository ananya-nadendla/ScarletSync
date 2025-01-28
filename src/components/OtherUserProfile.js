import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase"; // Import Firestore
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"; // Firestore query functions
import { useParams, useNavigate } from "react-router-dom"; // To access the username from the URL and navigate
import Loading from "./Loading";
import {
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriendRequest,
  unfriendUser,
  getRelationshipStatus,
} from "../util/friendUtils";

const OtherUserProfile = () => {
  const { username } = useParams(); // Get the username from the URL
  const [profileData, setProfileData] = useState(null);
  const [friendCount, setFriendCount] = useState(0); // State for friend count
  const [friendsList, setFriendsList] = useState([]); // State for the list of friends
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Add a loading state
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [relationshipStatus, setRelationshipStatus] = useState("not friends");
  const [requestId, setRequestId] = useState(null); // For handling request updates

  const currentUserUid = auth.currentUser?.uid; // Replace with actual current user UID from auth
  const [otherUserUid, setOtherUserUid] = useState(null); // Store the UID of the profile being viewed

 //If user accesses /profile/MYprofile, redirect to /profile so that they can't friend themselves
  useEffect(() => {
    // Fetch the logged-in user's profile
    const fetchLoggedInUserProfile = async () => {
      try {
        const loggedInUserProfileDoc = await getDoc(doc(db, "profiles", currentUserUid)); // Use currentUserUid to get the logged-in user's profile
        const loggedInUserProfileData = loggedInUserProfileDoc.data();

        // Ensure the current user is not trying to visit their own profile
        if (loggedInUserProfileData?.username === username) {
          navigate("/profile", { replace: true }); // Redirect to /profile
        }
      } catch (error) {
        setError("Error fetching logged-in user's profile:", error);
      }
    };

    // Fetch logged-in user's profile only if profileData is available
    if (profileData) {
      fetchLoggedInUserProfile();
    }
  }, [username, profileData, navigate, currentUserUid]);


  useEffect(() => {
    // Fetch the other user's profile
    const fetchProfile = async () => {
      setLoading(true); // Start loading
      try {
        // Query the profiles collection to find a document where username matches
        const profilesRef = collection(db, "profiles");
        const q = query(profilesRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Profile not found
          setLoading(false); // Stop loading
          navigate("/page-not-found", { replace: true }); // Navigate to page-not-found
        } else {
          // Assuming there will only be one document with the matching username
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            setProfileData(data); // Set the profile data from the query result
            setOtherUserUid(doc.id); // Set the UID of the other user
            setFriendCount(data.friends?.length || 0); // Set friend count
            setFriendsList(data.friends || []); // Set friends list
          });
          setLoading(false); // Stop loading after setting profile data
        }
      } catch (err) {
        setError("Error fetching profile data.");
        setLoading(false); // Stop loading on error
      }
    };

    fetchProfile();
  }, [username, navigate]); // Re-run when username changes

  useEffect(() => {
    if (currentUserUid && otherUserUid) {
      const fetchRelationshipStatus = async () => {
        const result = await getRelationshipStatus(currentUserUid, otherUserUid);
        setRelationshipStatus(result.status);
        setRequestId(result.requestId || null);
      };
      fetchRelationshipStatus();
    }
  }, [currentUserUid, otherUserUid]);

  useEffect(() => {
    const updateFriendCount = async () => {
      if (friendsList.length > 0) {
        const validFriends = [];
        for (const friendUid of friendsList) {
          const friendDoc = await getDoc(doc(db, "profiles", friendUid));
          if (friendDoc.exists()) {
            validFriends.push(friendUid);
          }
        }

        if (validFriends.length !== friendsList.length) {
          setFriendCount(validFriends.length);
          setFriendsList(validFriends);
        }
      }
    };

    updateFriendCount();
  }, [friendsList]);

  const handleSendRequest = async () => {
    const result = await sendFriendRequest(currentUserUid, otherUserUid);
    if (result.success) {
      setRelationshipStatus("request sent");
    } else {
      setError("Failed to send friend request.");
    }
  };

  const handleAcceptRequest = async () => {
    if (requestId) {
      const result = await acceptFriendRequest(requestId, otherUserUid, currentUserUid);
      if (result.success) {
        setRelationshipStatus("friends");
      } else {
        setError("Failed to accept friend request.");
      }
    }
  };

  const handleDeclineRequest = async () => {
    if (requestId) {
      const result = await deleteFriendRequest(requestId);
      if (result.success) {
        setRelationshipStatus("not friends");
      } else {
        setError("Failed to decline friend request.");
      }
    }
  };

  const handleUnfriend = async () => {
    const result = await unfriendUser(currentUserUid, otherUserUid);
    if (result.success) {
      setRelationshipStatus("not friends");
      setFriendCount((prevCount) => Math.max(prevCount - 1, 0));
    } else {
      setError("Failed to unfriend user.");
    }
  };

  if (loading) {
    return <Loading message="Fetching user profile..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profileData) {
    return null; // Prevent rendering if profile data is not set
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

          {/* Display the friend count for the other user */}
          <div className="friend-count">
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

      {/* Friend Actions */}
      <div className="friend-actions">
        {relationshipStatus === "not friends" && (
          <button onClick={handleSendRequest}>Send Friend Request</button>
        )}
        {relationshipStatus === "request sent" && (
          <button onClick={handleDeclineRequest}>Cancel Friend Request</button>
        )}
        {relationshipStatus === "request received" && (
          <>
            <button onClick={handleAcceptRequest}>Accept Friend Request</button>
            <button onClick={handleDeclineRequest}>Decline Friend Request</button>
          </>
        )}
        {relationshipStatus === "friends" && (
          <button onClick={handleUnfriend}>Unfriend</button>
        )}
      </div>

    </div>
  );
};

export default OtherUserProfile;
