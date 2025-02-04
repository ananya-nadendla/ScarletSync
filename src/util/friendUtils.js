import { db } from "../config/firebase";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

// Send a friend request
export const sendFriendRequest = async (fromUid, toUid) => {
  const friendRequestsRef = collection(db, "friendRequests");
  try {
    await addDoc(friendRequestsRef, {
      from: fromUid,
      to: toUid,
      status: "pending",
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false, error };
  }
};

// Accept a friend request
export const acceptFriendRequest = async (requestId, fromUid, toUid) => {
  const fromUserRef = doc(db, "profiles", fromUid);
  const toUserRef = doc(db, "profiles", toUid);
  const friendRequestRef = doc(db, "friendRequests", requestId);

  try {
    // Add each other as friends
    await updateDoc(fromUserRef, {
      friends: arrayUnion(toUid),
    });
    await updateDoc(toUserRef, {
      friends: arrayUnion(fromUid),
    });

    // Update the friend request status to accepted
    await updateDoc(friendRequestRef, {
      status: "accepted",
    });
    return { success: true };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return { success: false, error };
  }
};

// Decline or cancel a friend request
export const deleteFriendRequest = async (requestId) => {
  const friendRequestRef = doc(db, "friendRequests", requestId);
  try {
    await deleteDoc(friendRequestRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting friend request:", error);
    return { success: false, error };
  }
};

// Unfriend a user
export const unfriendUser = async (fromUid, toUid) => {
  const fromUserRef = doc(db, "profiles", fromUid);
  const toUserRef = doc(db, "profiles", toUid);

  try {
    await updateDoc(fromUserRef, {
      friends: arrayRemove(toUid),
    });
    await updateDoc(toUserRef, {
      friends: arrayRemove(fromUid),
    });
    return { success: true };
  } catch (error) {
    console.error("Error unfriending user:", error);
    return { success: false, error };
  }
};

// Check relationship status
export const getRelationshipStatus = async (currentUid, otherUid) => {
  const friendRequestsRef = collection(db, "friendRequests");
  try {
    // Check if there's a pending request
    const sentQuery = query(
      friendRequestsRef,
      where("from", "==", currentUid),
      where("to", "==", otherUid),
      where("status", "==", "pending")
    );
    const receivedQuery = query(
      friendRequestsRef,
      where("from", "==", otherUid),
      where("to", "==", currentUid),
      where("status", "==", "pending")
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(sentQuery), getDocs(receivedQuery)]);

    if (!sentSnapshot.empty) {
      return { status: "request sent", requestId: sentSnapshot.docs[0].id };
    }
    if (!receivedSnapshot.empty) {
      return { status: "request received", requestId: receivedSnapshot.docs[0].id };
    }

    // Check if they are already friends
    const userRef = doc(db, "profiles", currentUid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const friends = userData.friends || [];

      // Check if the friend exists in the list
      if (Array.isArray(friends) && friends.includes(otherUid)) {
        return { status: "friends" };
      }
    }

    return { status: "not friends" };
  } catch (error) {
    console.error("Error checking relationship status:", error);
    return { status: "error", error };
  }
};

// Handle profile deletion in regards to friending
// Called in Settings.js
/* Removes to things:
    1) The deleted user's UID is deleted from the "friends" field of other people's profiles (in the "profiles" firebase collection)
    2) In "friendRequests", any friendRequest containing the deleted user's UID in the "from" or "to" fields deletes the whole friendRequest
*/
export const handleProfileDeletion = async (userUid) => {
  try {
    console.log(`Starting deletion process for user: ${userUid}`);

    // Remove the user from other users' friends lists
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("friends", "array-contains", userUid));
    const querySnapshot = await getDocs(q);

    for (const docSnapshot of querySnapshot.docs) {
      console.log(`Removing ${userUid} from friends list of: ${docSnapshot.id}`);
      await updateDoc(doc(db, "profiles", docSnapshot.id), {
        friends: arrayRemove(userUid),
      });
    }

    // Delete any pending or accepted friend requests involving the user
    const friendRequestsRef = collection(db, "friendRequests");
    const sentRequestsQuery = query(friendRequestsRef, where("from", "==", userUid));
    const receivedRequestsQuery = query(friendRequestsRef, where("to", "==", userUid));

    const [sentRequests, receivedRequests] = await Promise.all([
      getDocs(sentRequestsQuery),
      getDocs(receivedRequestsQuery),
    ]);

    for (const docSnapshot of [...sentRequests.docs, ...receivedRequests.docs]) {
      console.log(`Deleting friend request involving ${userUid}: ${docSnapshot.id}`);
      await deleteDoc(doc(db, "friendRequests", docSnapshot.id));
    }

    console.log(`Profile and related data cleaned up for user: ${userUid}`);
    return { success: true };
  } catch (error) {
    console.error("Error handling profile deletion:", error);
    return { success: false, error };
  }
};
