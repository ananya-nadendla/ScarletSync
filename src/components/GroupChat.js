import { useEffect, useState } from "react";
import { Channel, MessageList, MessageInput, Chat } from "stream-chat-react";
import { db } from "../config/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useStreamChat } from "../context/StreamChatContext";
import "../styles/GroupChat.css";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import Loading from "./Loading";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique ID generation

// Function to fetch the Stream token from the backend
const fetchStreamToken = async (userId) => {
  try {
    const response = await fetch("http://localhost:5000/stream/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching Stream token:", error);
  }
};

// Function to add a user to an existing channel
/*const addUserToChannel = async (username, channel) => {
  try {
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`User ${username} does not exist!`);
    } else {
      querySnapshot.forEach((doc) => {
        const userUid = doc.id;
        channel.addMembers([userUid]);
        alert(`User ${username} added to the channel!`);
      });
    }
  } catch (error) {
    console.error("Error adding user to channel:", error);
    alert("Something went wrong. Please try again.");
  }
};*/

// Function to start a DM
const startDirectMessage = async (currentUserId, recipientUsername, client, setChannel) => {
  try {
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("username", "==", recipientUsername));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`User ${recipientUsername} does not exist!`);
      return;
    }

    let recipientId = "";
    let recipientName = "";

    querySnapshot.forEach((doc) => {
      recipientId = doc.id;
      const userData = doc.data();
      recipientName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || recipientUsername;
    });

    const channelId = [currentUserId, recipientId].sort().join("-");
    let channel = client.channel("messaging", channelId, {
      members: [currentUserId, recipientId],
    });

    await channel.create();

    // Ensure each user sees the other's name as the channel name
    channel.data.name = recipientId === currentUserId ? recipientName : "Direct Message";
    setChannel(channel);
  } catch (error) {
    console.error("Error starting DM:", error);
    alert("Something went wrong. Please try again.");
  }
};

const GroupChat = ({ userId }) => {
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState(null);
  const [newUser, setNewUser] = useState("");
  const [dmUser, setDmUser] = useState(""); // State for DM input
  const { client, setClient } = useStreamChat();

    const handleAddUser = async () => {
      if (newUser.trim() === "" || !channel) return;

      try {
        // Query Firebase to find user by username
        const profilesRef = collection(db, "profiles");
        const q = query(profilesRef, where("username", "==", newUser));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          alert(`User ${newUser} does not exist!`);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userUid = userDoc.id; // Get the UID of the user

        // Add the user to the channel
        await channel.addMembers([userUid]);

        // Fetch updated member count
        await channel.watch(); // Refresh channel info
        const memberCount = Object.keys(channel.state.members).length;

        // If there are now 3 or more members, rename to "New Group Chat"
        if (memberCount >= 3) {
          await channel.update({ name: "New Group Chat" });
        }

        alert(`User ${newUser} added successfully!`);
        setNewUser(""); // Clear input field
      } catch (error) {
        console.error("Error adding user to channel:", error);
        alert("Something went wrong. Please try again.");
      }
    };

  const handleStartDM = async () => {
    if (dmUser.trim() === "" || !client) return;

    try {
      console.log("Starting DM with:", dmUser);

      const profilesRef = collection(db, "profiles");
      const q = query(profilesRef, where("username", "==", dmUser));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert(`User ${dmUser} does not exist!`);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userUid = userDoc.id;

      if (userUid === userId) {
        alert("You cannot DM yourself!");
        return;
      }

      console.log(`User UID for ${dmUser}:`, userUid);

      // 🔍 **DEBUG: Check which channels the current user can see**
      const visibleChannels = await client.queryChannels(
        { type: "messaging", members: { $in: [userId] } }
      );
      console.log("Channels visible to this user:", visibleChannels.map(ch => ch.id));

      // Fetch all channels where this user is a member
      const existingChannels = await client.queryChannels(
        {
          type: "messaging",
          members: { $in: [userId] },
        },
        { last_message_at: -1 },
        { watch: true, state: true }
      );

      // Correctly find an existing DM with only these 2 users
      let existingDM = existingChannels.find(
        (ch) =>
          Object.keys(ch.state.members).length === 2 && // Ensure it's a 1-on-1 DM
          ch.state.members[userId] && // Check if current user is a member
          ch.state.members[userUid] // Check if the recipient is a member
      );


      if (!existingDM) {
        for (let ch of existingChannels) {
          const members = Object.keys(ch.state.members);
          if (members.length === 2 && members.includes(userId) && members.includes(userUid)) {
            existingDM = ch;
            break;
          }
        }
      }

      if (existingDM) {
        console.log("Existing DM found, switching to it:", existingDM.id);
        setChannel(existingDM);
      } else {
        console.log("No existing DM found, creating a new one...");

        const shortUUID = uuidv4().split("-")[0];
        const newChannelId = `dm-${userId.substring(0, 8)}-${userUid.substring(0, 8)}-${shortUUID}`;

        console.log("New DM ID:", newChannelId);

        const newChannel = client.channel("messaging", newChannelId, {
          members: [userId, userUid],
          created_by_id: userId,  // ✅ Set creator to avoid permission issues
          own_capabilities: ["read", "write", "add_members"],  // ✅ Ensure visibility
        });

        await newChannel.create();
        await newChannel.addMembers([userId, userUid]);
        await newChannel.watch(); // Ensure it's fully accessible

        console.log("New DM created:", newChannel.id);

        setChannels((prevChannels) => [...prevChannels, newChannel]);
        setChannel(newChannel);
      }

      setDmUser("");
    } catch (error) {
      console.error("Error starting DM:", error);
      alert(`Something went wrong: ${error.message}`);
    }
  };


  useEffect(() => {
    const setupChat = async () => {
      if (!userId || client) return;

      try {
        const userDoc = await getDoc(doc(db, "profiles", userId));
        let displayName = "New User";

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firstName = userData.firstName || "";
          const lastName = userData.lastName || "";
          displayName = `${firstName} ${lastName}`.trim() || userId;
        }

        const token = await fetchStreamToken(userId);
        const streamClient = StreamChat.getInstance(process.env.REACT_APP_STREAM_API_KEY);

        await streamClient.connectUser({ id: userId, name: displayName, role: "user" }, token);
        setClient(streamClient);

        let channels = await streamClient.queryChannels({ members: { $in: [userId] } });

        if (channels.length === 0) {
          const defaultChannel = streamClient.channel("messaging", `welcome-${userId}`, {
            name: `${displayName}'s Chat`,
            members: [userId],
          });
          await defaultChannel.create();
          channels = [defaultChannel];
        }

        setChannels(channels);
        setChannel(channels[0]);
      } catch (error) {
        console.error("Error setting up chat:", error);
      }
    };

    setupChat();

    return () => {
      if (client) {
        client.disconnectUser();
        setClient(null);
      }
    };
  }, [userId, client, setClient]);

  if (!channels.length || !client) return <Loading message="Loading chats..." />;

  return (
    <div className="groupchat-container">
      {/* Sidebar (Channels, Add User, DM Section) */}
      <div className="groupchat-sidebar">
        <h2>Channels</h2>
        <div className="channel-list">
          {channels.map((ch) => {
            // If it's a DM, show the name of the other user instead of an empty box
            let channelName = ch.data.name || "Unnamed Channel";

            if (ch.data.member_count === 2) {
              const otherUser = Object.keys(ch.state.members).find((member) => member !== userId);
              if (otherUser) {
                const otherMember = ch.state.members[otherUser];
                channelName = otherMember?.user?.name || "Direct Message";
              }
            }

            return (
              <button key={ch.id} onClick={() => setChannel(ch)}>
                {channelName}
              </button>
            );
          })}
        </div>

        {/* Add User Section */}
        <div className="add-user-section">
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Enter username to add"
          />
          <button onClick={handleAddUser}>Add User</button>
        </div>

        {/* Direct Messaging Section */}
        <div className="dm-section">
          <input
            type="text"
            value={dmUser}
            onChange={(e) => setDmUser(e.target.value)}
            placeholder="Enter username to DM"
          />
          <button onClick={handleStartDM}>DM</button>
        </div>
      </div>

      {/* Chat Container */}
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
