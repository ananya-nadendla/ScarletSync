import { useEffect, useState } from "react";
import { Channel, MessageList, MessageInput, Chat } from "stream-chat-react";
import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useStreamChat } from "../context/StreamChatContext";
import "../styles/GroupChat.css";
import { StreamChat } from "stream-chat";

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

const GroupChat = ({ userId }) => {
  const [channel, setChannel] = useState(null);
  const { client, setClient } = useStreamChat();

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

        // Log user role and permissions
        console.log("User role:", streamClient.user.role);
        console.log("User permissions:", streamClient.user.permissions);

        setClient(streamClient); // Update the global client

        // Create a unique channel for the user
        const userChannel = streamClient.channel("messaging", `user-${userId}`, {
          name: `${username}'s Channel`,
          members: [userId], // Ensure the user is added as a member
        });

        await userChannel.watch(); // Watch the channel
        setChannel(userChannel);
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

  if (!channel || !client) return <div>Loading...</div>;

  return (
    <div className="groupchat-container">
      <div className="groupchat-header">{channel.data.name}</div>
      <div className="groupchat-chat-container">
        <Chat client={client}>
          <Channel channel={channel}>
            <MessageList className="groupchat-message-list" />
            <MessageInput className="groupchat-message-input" />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default GroupChat;