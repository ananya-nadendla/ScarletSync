import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase"; // Import Firestore and Auth
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore"; // Firestore functions
import { acceptFriendRequest, deleteFriendRequest } from "../util/friendUtils"; // Your friend request functions

const Notifications = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState("");
  const currentUserUid = auth.currentUser?.uid; // Get current user's UID

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

            if (senderUsername) {
              requests.push({
                id: docSnapshot.id,
                from: senderUsername,
                fromUid: fromUid,
                to: request.to,
                status: request.status,
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching profile for UID: ${fromUid}`, err);
        }
      }

      setPendingRequests(requests);
      if (requests.length === 0) setError("No pending friend requests.");
      else setError("");
    });

    return () => unsubscribe(); // Cleanup listener on unmount
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
      <h1>Notifications</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="friend-requests">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <div key={request.id} className="request-item">
              <p>
                {request.from} sent you a friend request.{" "}
                <button onClick={() => handleAcceptRequest(request.id, request.fromUid)}>
                  Accept
                </button>
                <button onClick={() => handleDeclineRequest(request.id)}>
                  Decline
                </button>
              </p>
            </div>
          ))
        ) : (
          <p>No pending friend requests.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
