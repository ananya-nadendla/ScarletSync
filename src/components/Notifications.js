import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase"; // Import Firestore and Auth
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"; // Firestore functions
import { acceptFriendRequest, deleteFriendRequest } from "../util/friendUtils"; // Your friend request functions

const Notifications = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState("");
  const currentUserUid = auth.currentUser?.uid; // Get current user's UID

  useEffect(() => {
    const fetchRequests = async () => {
      if (currentUserUid) {
        try {
          console.log("Fetching friend requests for user:", currentUserUid);

          const friendRequestsRef = collection(db, "friendRequests");
          const q = query(
            friendRequestsRef,
            where("to", "==", currentUserUid),
            where("status", "==", "pending")
          );
          const querySnapshot = await getDocs(q);

          const requests = [];

          for (const docSnapshot of querySnapshot.docs) {
            const request = docSnapshot.data();
            const fromUid = request.from;

            console.log("Fetching profile for UID:", fromUid);

            const userProfileDoc = await getDoc(doc(db, "profiles", fromUid));
            if (userProfileDoc.exists()) {
              const userProfileData = userProfileDoc.data();
              const senderUsername = userProfileData.username;

              if (senderUsername) {
                console.log(`Found username: ${senderUsername}`);
                requests.push({
                  id: docSnapshot.id,
                  from: senderUsername, // Explicitly set the username
                  fromUid: fromUid, // Store UID for reference
                  to: request.to, // Explicitly set other fields to avoid overwriting
                  status: request.status,
                });
              } else {
                console.error(`Username not found for UID: ${fromUid}`);
              }
            } else {
              console.error(`Profile not found for UID: ${fromUid}`);
            }
          }

          console.log("Final requests array before state update:", requests);

          if (requests.length === 0) {
            setError("No pending friend requests.");
          } else {
            setPendingRequests(requests);
            console.log("Updated pendingRequests state:", requests);
          }
        } catch (err) {
          setError("Error fetching friend requests.");
          console.error(err);
        }
      }
    };

    fetchRequests();
  }, [currentUserUid]);

  const handleAcceptRequest = async (requestId, fromUid) => {
    console.log("Accepting friend request:", { requestId, fromUid });
    const result = await acceptFriendRequest(requestId, fromUid, currentUserUid);
    if (result.success) {
      console.log("Successfully accepted request:", requestId);
      setPendingRequests(pendingRequests.filter((req) => req.id !== requestId));
    } else {
      console.error("Failed to accept friend request:", result.error);
      setError("Failed to accept friend request.");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    console.log("Declining friend request:", requestId);
    const result = await deleteFriendRequest(requestId);
    if (result.success) {
      console.log("Successfully declined request:", requestId);
      setPendingRequests(pendingRequests.filter((req) => req.id !== requestId));
    } else {
      console.error("Failed to decline friend request:", result.error);
      setError("Failed to decline friend request.");
    }
  };

  return (
    <div>
      <h1>Notifications</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="friend-requests">
        {console.log("Rendering pendingRequests:", pendingRequests)}
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => {
            console.log("Rendering request:", request);
            return (
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
            );
          })
        ) : (
          <p>No pending friend requests.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
