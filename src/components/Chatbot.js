import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Import Firestore and Auth
import { doc, onSnapshot } from "firebase/firestore"; // Firestore functions
import "../styles/Chatbot.css"; // Import the CSS for chatbot styling

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // State to hold user profile data
  const [chatHistory, setChatHistory] = useState([]); // Track chat history
  const [botState, setBotState] = useState("idle"); // "thinking" | "talking" | "idle"

  const user = auth.currentUser;

  // Fetch the user profile from Firestore and listen for changes
  useEffect(() => {
    const unsubscribe = async () => {
      if (user) {
        const userProfileDoc = doc(db, "profiles", user.uid);

        // Set up a real-time listener
        onSnapshot(userProfileDoc, (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUserProfile(docSnapshot.data()); // Update profile data whenever it changes
          }
        });
      }
    };
    unsubscribe(); // Unsubscribe from listener when component unmounts

    return () => unsubscribe(); // Cleanup when component unmounts
  }, [user]);

  // Add intro message when the component mounts
  useEffect(() => {
    setChatMessages([
      { sender: "bot", text: "Hello! I'm your AI Advisor, here to assist you with any questions about Rutgers University. Whether you're curious about programs, events, or campus life, I'm ready to help!" }
    ]);
  }, []);

  // Function to send message to backend
  const sendMessage = async (message) => {
    console.log("Sending message: ", message); // Log the message being sent
    setLoading(true); // Show loading indicator while waiting for response
    setBotState("thinking"); // Set bot to thinking mode

    // Clear the input field immediately after sending the message
    setMessage("");

    if (userProfile) {
      try {
        console.log("User profile data:", userProfile); // Log user profile

        // Append the new user message to chat history and chatMessages
        const updatedHistory = [...chatHistory, { sender: "user", text: message }];
        setChatMessages([...chatMessages, { sender: "user", text: message }]);

        const response = await fetch("http://localhost:5000/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userQuery: message,
            userProfile: {
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              schoolYear: userProfile.schoolYear,
              major: userProfile.major,
              minor: userProfile.minor,
              selectedSubInterests: userProfile.selectedSubInterests,
              campusLocation: userProfile.campusLocation,
              bio: userProfile.bio,
            },
            chatHistory: updatedHistory,  // Send the updated chat history
          }),
        });

        const data = await response.json();
        console.log("Response data:", data); // Log the parsed response
        setBotState("talking"); // Set bot to talking mode


        if (data.reply) {
          setChatHistory([...updatedHistory, { sender: "bot", text: data.reply }]);
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { text: data.reply, sender: "bot" },
          ]);
        } else {
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { text: "Sorry, I didn't get that. Please try again.", sender: "bot" },
          ]);
        }
      } catch (error) {
        console.error("Error in sending message:", error); // Log errors in the API call
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { text: "Sorry, something went wrong.", sender: "bot" },
        ]);
      }
    }

    setLoading(false); // Hide loading indicator after response
     setTimeout(() => setBotState("idle"), 1000); // Reset after 1 sec
  };

  return (
      <div className="chatbot-container">
        {/* Chat Header with Robot Avatar */}
        <div className="chatbot-header">
          <div className={`bot-avatar ${botState}`}>
            {botState === "thinking" ? "🤖💭" : "🤖😊"}
          </div>
          <h2>AI Chatbot</h2>
        </div>

        <div className="chatbox">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <p dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything about Rutgers..."
          />
          <button onClick={() => sendMessage(message)} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    );
  };

export default Chatbot;
