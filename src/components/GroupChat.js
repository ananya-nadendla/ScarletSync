import { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import { Channel, MessageList, MessageInput, Chat } from "stream-chat-react";
import { fetchStreamToken } from "../util/fetchStreamToken";
import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/GroupChat.css";

const GroupChat = ({ userId }) => {
  const [channel, setChannel] = useState(null);
  const [client, setClient] = useState(null);
  const clientRef = useRef(null); // Use a ref to track the client instance

  useEffect(() => {
    const setupChat = async () => {
      if (!userId || clientRef.current) return;

      try {
        // Fetch the username from Firebase
        const userDoc = await getDoc(doc(db, "profiles", userId));
        const username = userDoc.exists() ? userDoc.data().username : userId;


        // Fetch Stream token
        const token = await fetchStreamToken(userId);
        const streamClient = StreamChat.getInstance(process.env.REACT_APP_STREAM_API_KEY);
        await streamClient.connectUser(
          { id: userId, name: username },
          token
        );

        clientRef.current = streamClient; // Store the client instance

        const groupChannel = streamClient.channel("messaging", "group-chat", {
          name: "ScarletSync Group Chat",
          members: [userId],
        });

        await groupChannel.watch();
        setClient(streamClient);
        setChannel(groupChannel);
      } catch (error) {
        console.error("Error setting up chat:", error);
      }
    };

    setupChat();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnectUser();
        clientRef.current = null;
      }
    };
  }, [userId]); // Removed client and channel from dependency array

  if (!channel || !client) return <div>Loading...</div>;

  return (
    <div className="groupchat-container">
      <div className="groupchat-header">ScarletSync Group Chat</div>
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
