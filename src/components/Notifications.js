import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase"; // Import Firestore
import { collection, query, where, getDocs } from "firebase/firestore"; // Firestore query functions
//import { useNavigate } from "react-router-dom"; // Navigate to profile page
import { acceptFriendRequest, deleteFriendRequest } from "../util/friendUtils"; // Your friend request functions

const Notifications = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState("");
  const currentUserUid = auth.currentUser?.uid; // Get current user's UID
  //const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      if (currentUserUid) {
        try {
          // Query for incoming friend requests
          const friendRequestsRef = collection(db, "friendRequests");
          const q = query(
            friendRequestsRef,
            where("to", "==", currentUserUid),
            where("status", "==", "pending")
          );
          const querySnapshot = await getDocs(q);

          const requests = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPendingRequests(requests);
        } catch (err) {
          setError("Error fetching friend requests.");
          console.error(err);
        }
      }
    };

    fetchRequests();
  }, [currentUserUid]);

  const handleAcceptRequest = async (requestId, fromUid) => {
    const result = await acceptFriendRequest(requestId, fromUid, currentUserUid);
    if (result.success) {
      // Optionally update UI to reflect change (remove request from list)
      setPendingRequests(pendingRequests.filter((req) => req.id !== requestId));
    } else {
      setError("Failed to accept friend request.");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    const result = await deleteFriendRequest(requestId);
    if (result.success) {
      setPendingRequests(pendingRequests.filter((req) => req.id !== requestId));
    } else {
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
                <button onClick={() => handleAcceptRequest(request.id, request.from)}>
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
