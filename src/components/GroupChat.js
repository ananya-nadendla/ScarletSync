import { useEffect, useState } from "react";
import { Channel, MessageList, MessageInput, Chat } from "stream-chat-react";
import { db } from "../config/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"; // Firebase imports
import { useStreamChat } from "../context/StreamChatContext";
import "../styles/GroupChat.css";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import Loading from "./Loading"

// Function to fetch the Stream token from the backend
export const fetchStreamToken = async (userId) => {
  try {
    const response = await fetch("http://localhost:5000/stream/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching Stream token:", error);
  }
};

// Function to add a user to the Stream channel
const addUserToChannel = async (username, channel) => {
  try {
    // Query the profiles collection to find a document where username matches
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Profile not found
      alert(`User ${username} does not exist!`);
    } else {
      // Assuming there will only be one document with the matching username
      querySnapshot.forEach((doc) => {
        const userUid = doc.id; // Get the user's UID (same as Stream ID)

        // Add the user to the Stream channel
        channel.addMembers([userUid]);
        alert(`User ${username} added to the channel!`);
      });
    }
  } catch (error) {
    console.error("Error adding user to channel:", error);
    alert("Something went wrong. Please try again.");
  }
};

const GroupChat = ({ userId }) => {
  const [channels, setChannels] = useState([]); // State to hold all the channels
  const [channel, setChannel] = useState(null);
  const [newUser, setNewUser] = useState(""); // State to hold the username of the person to add
  const { client, setClient } = useStreamChat();

  const handleAddUser = () => {
    if (newUser.trim() === "") return;

    // Call the add user function
    addUserToChannel(newUser, channel);
    setNewUser(""); // Clear the input field after adding the user
  };

  useEffect(() => {
    const setupChat = async () => {
      if (!userId || client) return;

      try {
        // Fetch the username from Firebase
        const userDoc = await getDoc(doc(db, "profiles", userId));
        const username = userDoc.exists() ? userDoc.data().username : userId;

        // Fetch Stream token
        const token = await fetchStreamToken(userId);
        const streamClient = StreamChat.getInstance(process.env.REACT_APP_STREAM_API_KEY);

        // Connect the new user
        await streamClient.connectUser(
          { id: userId, name: username, role: "user" }, // Ensure the role is set
          token
        );

        setClient(streamClient); // Update the global client

        // Fetch all channels the user is part of
        const channels = await streamClient.queryChannels({
          members: { $in: [userId] }, // Query channels where the user is a member
        });

        setChannels(channels); // Set the channels in the state

        // If the user is a member of any channel, set the first one as the default
        if (channels.length > 0) {
          setChannel(channels[0]);
        }
      } catch (error) {
        console.error("Error setting up chat:", error);
      }
    };

    setupChat();

    return () => {
      if (client) {
        client.disconnectUser(); // Cleanup on unmount
        setClient(null);
      }
    };
  }, [userId, client, setClient]);

  if (!channels.length || !client) return <Loading message="Loading chats..."/>;

    return (
    <div className="groupchat-container">
      {/* Sidebar (Channels + Add User Section) */}
      <div className="groupchat-sidebar">
        <h2>Channels</h2>
        <div className="channel-list">
          {channels.map((channel) => (
            <button key={channel.id} onClick={() => setChannel(channel)}>
              {channel.data.name}
            </button>
          ))}
        </div>

        {/* Add User Section (Now Inside Sidebar) */}
        <div className="add-user-section">
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Enter username to add"
          />
          <button onClick={handleAddUser}>Add User</button>
        </div>
      </div>

      {/* Chat Container - Spanning Full Right Section */}
      <div className="groupchat-chat-container">
    <Chat client={client}>
      <Channel channel={channel}>
        <div className="groupchat-channel">
          <MessageList className="groupchat-message-list" />
          <MessageInput className="groupchat-message-input" />
        </div>
      </Channel>
    </Chat>
      </div>
    </div>
  );
};

export default GroupChat;
