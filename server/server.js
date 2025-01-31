import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

app.post("/chatbot", async (req, res) => {
  const { userQuery, userProfile, rutgersInfo } = req.body;

  console.log("Received user query:", userQuery); // Log the query
  console.log("Received user profile:", userProfile); // Log the profile
  console.log("Received Rutgers info:", rutgersInfo); // Log the Rutgers info

  if (!userQuery || !userProfile) {
    return res.status(400).json({ error: "Missing user query or user profile" });
  }

  // Construct a dynamic prompt based on the user query
  let dynamicPrompt = `
    You are a chatbot for ScarletSync, a Rutgers student platform.
    Answer the user's question based on the user profile and Rutgers info.

    User Profile: ${JSON.stringify(userProfile)}
    Rutgers Information: ${JSON.stringify(rutgersInfo)}

    User Question: "${userQuery}"
  `;

  // Check if the query includes specific keywords (e.g., courses)
  if (userQuery.toLowerCase().includes("cs101") || userQuery.toLowerCase().includes("course")) {
    dynamicPrompt += `\n\nThe user is asking about courses. Please provide information specific to CS101 or any relevant course details.`;
  }

  try {
    const result = await model.generateContent(dynamicPrompt);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
