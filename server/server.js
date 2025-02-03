import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
