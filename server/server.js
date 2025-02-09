import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { StreamChat } from 'stream-chat';
import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

const streamApiKey = process.env.STREAM_API_KEY;
const streamApiSecret = process.env.STREAM_API_SECRET;
// Initialize Stream client (already loaded API key & secret)
const streamClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
// 🆕 Ensure "system" user exists in Stream
const ensureSystemUserExists = async () => {
  try {
    await streamClient.upsertUser({
      id: "system",
      name: "System",
      image: "https://via.placeholder.com/150", // Optional system avatar
    });
    console.log("✅ System user initialized in Stream Chat.");
  } catch (error) {
    console.error("❌ Error initializing system user:", error);
  }
};
// ✅ Call function on server start
ensureSystemUserExists();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert("./firebase-service-account.json"),
});


const db = getFirestore();


app.post("/chatbot", async (req, res) => {
  const { userQuery, userProfile, chatHistory } = req.body;


  console.log("Received user query:", userQuery);
  console.log("Received user profile:", userProfile);
  console.log("Received chat history:", chatHistory); // Log the chat history

  if (!userQuery || !userProfile) {
    return res.status(400).json({ error: "Missing user query or user profile" });
  }

  try {
    // Fetch Rutgers info from Supabase
    const { data: rutgersInfo, error } = await supabase
      .from("rutgers_info")
      .select("text, embedding");

    if (error) {
      console.error("Error fetching Rutgers info:", error.message);
      return res.status(500).json({ error: "Error fetching Rutgers info" });
    }

    console.log("Fetched Rutgers info:", rutgersInfo);

    // Construct a dynamic prompt based on the user query and Rutgers info
    let dynamicPrompt = `
      You are a friendly and helpful chatbot for Rutgers University on the ScarletSync platform.
      Answer the user's question based on their profile and previous conversation history in a concise and engaging manner.
      Do not tell keep reminding user that you talked about a topic with them previously, as that sounds unfriendly.
      Keep your response <=50 words, but leave room for further conversation if necessary.

      If applicable, provide HTML links in your responses, but only after you attempt to answer the question yourself first.

      User Profile: ${JSON.stringify(userProfile)}

      Previous conversation history:
      ${chatHistory.slice(-5).map((msg) => `${msg.sender}: ${msg.text}`).join("\n")}

      User's current question: "${userQuery}"

      For example:
         - Use a proper HTML link like <a href="https://www.rutgers.edu/academics/majors">Rutgers Majors</a> instead of [Rutgers Majors](https://www.rutgers.edu/academics/majors).
    `;

    const result = await model.generateContent(dynamicPrompt);
    const botResponse = result.response.text();
        // Ensure any links in the response are in HTML anchor tag format
        const htmlResponse = botResponse.replace(
          /\[([^\]]+)\]\((http[^\)]+)\)/g,
          '<a href="$2" target="_blank">$1</a>'
        );

    res.json({ reply: htmlResponse });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong during query processing" });
  }
});

// Endpoint to generate Stream user token
app.post('/stream/token', (req, res) => {
  const { userId } = req.body;  // User ID should be passed from the frontend

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const token = streamClient.createToken(userId);  // Generate token for user
    res.json({ token });  // Return the token to the frontend
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.post('/stream/delete-user', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch all channels where the user is a member
    const userChannels = await streamClient.queryChannels({ members: { $in: [userId] } });

    // Remove user from all their channels
    for (const channel of userChannels) {
      await channel.removeMembers([userId]);
    }

    // Attempt a hard delete first
    try {
      await streamClient.deleteUser(userId, { hard_delete: true });
      console.log(`User ${userId} hard deleted from Stream.`);
    } catch (hardDeleteError) {
      console.warn(`Hard delete failed for ${userId}. Trying soft delete...`);

      // If hard delete fails (likely due to message history), perform a soft delete instead
      await streamClient.deleteUser(userId, { soft_delete: true });
      console.log(`User ${userId} soft deleted from Stream.`);
    }

    res.json({ message: "User successfully removed from Stream Chat." });
  } catch (error) {
    console.error("Error deleting Stream user:", error);
    res.status(500).json({ error: "Failed to delete Stream user." });
  }
});

// ✅ Leave Chat & Send System Message (with username)
app.post("/stream/leave-chat", async (req, res) => {
  const { userId, channelId } = req.body;

  if (!userId || !channelId) {
    return res.status(400).json({ error: "User ID and Channel ID are required" });
  }

  try {
    const channel = streamClient.channel("messaging", channelId);
    await channel.removeMembers([userId]);

    // ✅ Fetch username
    const username = await getUsernameFromFirestore(userId);

    await channel.sendMessage({
      text: `🚪 ${username} has left the chat.`,
      user_id: "system",
    });

    await channel.watch();
    const remainingMembers = Object.keys(channel.state.members).length;

    if (remainingMembers === 0) {
      await channel.delete();
      console.log(`Channel ${channelId} deleted as it had no members.`);
    }

    res.json({ success: true, message: "User left the chat." });
  } catch (error) {
    console.error("Error leaving chat:", error);
    res.status(500).json({ success: false, message: "Failed to leave chat." });
  }
});

// ✅ Remove User from Chat & Send System Message (with username)
app.post("/stream/remove-user", async (req, res) => {
  const { adminId, removeUserId, channelId } = req.body;

  if (!adminId || !removeUserId || !channelId) {
    return res.status(400).json({ error: "Admin ID, User ID, and Channel ID are required" });
  }

  try {
    const channel = streamClient.channel("messaging", channelId);
    await channel.watch();

    const creatorId = channel.data?.created_by?.id;
    if (adminId !== creatorId) {
      return res.status(403).json({ error: "Only the chat admin can remove users." });
    }

    if (!channel.state.members[removeUserId]) {
      return res.status(404).json({ error: "User is not in this chat!" });
    }

    await channel.removeMembers([removeUserId]);

    // ✅ Fetch username
    const username = await getUsernameFromFirestore(removeUserId);

    await channel.sendMessage({
      text: `⚠️ ${username} has been removed from the chat.`,
      user_id: "system",
    });

    await channel.watch();
    const remainingMembers = Object.keys(channel.state.members).length;

    if (remainingMembers === 0) {
      await channel.delete();
      console.log(`Channel ${channelId} deleted as it had no members.`);
    }

    res.json({ success: true, message: `User ${username} removed from chat.` });
  } catch (error) {
    console.error("Error removing user from chat:", error);
    res.status(500).json({ success: false, message: "Failed to remove user from chat." });
  }
});

// ✅ Add User to Chat & Send System Message (with username)
app.post("/stream/add-user", async (req, res) => {
  const { adminId, newUserId, channelId } = req.body;

  if (!adminId || !newUserId || !channelId) {
    return res.status(400).json({ error: "Admin ID, New User ID, and Channel ID are required" });
  }

  try {
    const channel = streamClient.channel("messaging", channelId);
    await channel.watch();

    const creatorId = channel.data?.created_by?.id;
    if (adminId !== creatorId) {
      return res.status(403).json({ error: "Only the chat admin can add users." });
    }

    await channel.addMembers([newUserId]);

    // ✅ Fetch username
    const username = await getUsernameFromFirestore(newUserId);

    await channel.sendMessage({
      text: `📢 ${username} has been added to the chat.`,
      user_id: "system",
    });

    res.json({ success: true, message: `User ${username} added to chat.` });
  } catch (error) {
    console.error("Error adding user to chat:", error);
    res.status(500).json({ success: false, message: "Failed to add user to chat." });
  }
});

app.post("/stream/rename-chat", async (req, res) => {
  const { userId, channelId, newChatName } = req.body;

  if (!userId || !channelId || !newChatName.trim()) {
    return res.status(400).json({ error: "User ID, Channel ID, and New Chat Name are required" });
  }

  try {
    const channel = streamClient.channel("messaging", channelId);
    await channel.watch(); // Ensure latest state

    // ✅ Check if the requester is the admin (creator of the chat)
    const creatorId = channel.data?.created_by?.id;
    if (userId !== creatorId) {
      return res.status(403).json({ error: "Only the chat admin can rename this chat." });
    }

    // Get the user’s name from Stream
    const user = await streamClient.queryUsers({ id: userId });
    const username = user.users[0]?.name || "Unknown User";

    // ✅ Update the channel name
    await channel.update({ name: newChatName });

    // ✅ Send system message
    await channel.sendMessage({
      text: `✏️ The chat has been renamed to **${newChatName}** by ${username}.`,
      user_id: "system",
      custom_type: "system",
    });

    res.json({ success: true, message: "Chat renamed successfully" });
  } catch (error) {
    console.error("Error renaming chat:", error);
    res.status(500).json({ success: false, message: "Failed to rename chat" });
  }
});

app.post("/stream/update-profile", async (req, res) => {
  const { userId, profileImage } = req.body;

  if (!userId || !profileImage) {
    return res.status(400).json({ error: "User ID and Profile Image URL are required" });
  }

  try {
    // Update the user's profile in Stream Chat
    await streamClient.upsertUser({
      id: userId,
      image: profileImage, // Update the profile picture
    });

    res.json({ success: true, message: "Stream user profile updated successfully." });
  } catch (error) {
    console.error("Error updating Stream user profile:", error);
    res.status(500).json({ error: "Failed to update Stream user profile." });
  }
});



// ✅ Fetch username from Firestore using UID
const getUsernameFromFirestore = async (userId) => {
  try {
    const userDoc = await db.collection("profiles").doc(userId).get();

    if (!userDoc.exists) {
      console.warn(`No user found for UID: ${userId}`);
      return "Unknown User";
    }

    const userData = userDoc.data();
    return userData.username || "Unknown User";
  } catch (error) {
    console.error("Error fetching username from Firestore:", error);
    return "Unknown User";
  }
};


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
