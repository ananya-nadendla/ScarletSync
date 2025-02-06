import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { StreamChat } from 'stream-chat';

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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
