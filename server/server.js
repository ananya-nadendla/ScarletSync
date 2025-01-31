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

  const prompt = `
    You are a chatbot for ScarletSync, a Rutgers student platform.
    Answer using:
    - User profile: ${JSON.stringify(userProfile)}
    - Rutgers data: ${JSON.stringify(rutgersInfo)}

    User Question: "${userQuery}"
  `;

  try {
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
