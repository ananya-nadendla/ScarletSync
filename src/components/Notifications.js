import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { acceptFriendRequest, deleteFriendRequest } from "../util/friendUtils";
import "../styles/Notifications.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons"; // Import bell icon

const Notifications = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState("");
  const currentUserUid = auth.currentUser?.uid;
  const DEFAULT_PROFILE_IMAGE =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpPPrc8VMEPWqvFtOIxFZLDCN4JITg01d-KA&s";

  useEffect(() => {
    if (!currentUserUid) return;

    const friendRequestsRef = collection(db, "friendRequests");
    const q = query(
      friendRequestsRef,
      where("to", "==", currentUserUid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const requests = [];

      for (const docSnapshot of querySnapshot.docs) {
        const request = docSnapshot.data();
        const fromUid = request.from;

        try {
          const userProfileDoc = await getDoc(doc(db, "profiles", fromUid));
          if (userProfileDoc.exists()) {
            const userProfileData = userProfileDoc.data();
            const senderUsername = userProfileData.username;
            const senderProfileImage = userProfileData.profileImage || DEFAULT_PROFILE_IMAGE;

            if (senderUsername) {
              requests.push({
                id: docSnapshot.id,
                from: senderUsername,
                fromUid: fromUid,
                profileImage: senderProfileImage,
                status: request.status,
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching profile for UID: ${fromUid}`, err);
        }
      }

      setPendingRequests(requests);
      if (requests.length === 0) setError("");
      else setError("");
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  const handleAcceptRequest = async (requestId, fromUid) => {
    try {
      const result = await acceptFriendRequest(requestId, fromUid, currentUserUid);
      if (result.success) {
        setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
      } else {
        throw new Error(result.error || "Failed to accept friend request.");
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setError("Failed to accept friend request.");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const result = await deleteFriendRequest(requestId);
      if (result.success) {
        setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
      } else {
        throw new Error(result.error || "Failed to decline friend request.");
      }
    } catch (err) {
      console.error("Error declining friend request:", err);
      setError("Failed to decline friend request.");
    }
  };

  return (
    <div>
      <h2 className="notifications-title">
              {/*<FontAwesomeIcon icon={faBell} className="notif-bell-icon" />*/} Notifications
            </h2>
      {error && <div className="error-message">{error}</div>}

      <div className="friend-requests">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <div key={request.id} className="notification-card">
              <img src={request.profileImage} alt="Profile" className="notif-profile-picture" />
              <div className="notification-content">
                <p>
                  <strong>{request.from}</strong> sent you a friend request.
                </p>
                <div className="notification-actions">
                  <button className="accept-btn" onClick={() => handleAcceptRequest(request.id, request.fromUid)}>
                    Accept
                  </button>
                  <button className="decline-btn" onClick={() => handleDeclineRequest(request.id)}>
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-notifications">No new friend requests.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
