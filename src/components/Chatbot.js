//CURRENTLY UTILIZING FAKE USER DATA
import React, { useState } from "react";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to send message to backend
  const sendMessage = async (message) => {
    setLoading(true); // Show loading indicator while waiting for response

    try {
      const response = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: message,
          userProfile: { interests: ["AI", "CS"], courses: ["CS101"] }, // Replace with real user data
          rutgersInfo: { courses: { CS101: "Intro to Computer Science" } } // Replace with real Rutgers data
        }),
      });

      const data = await response.json();
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { text: data.reply, sender: "bot" },
      ]);
      setMessage(""); // Clear input field after sending message
    } catch (error) {
      console.error("Error:", error);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { text: "Sorry, something went wrong.", sender: "bot" },
      ]);
    }

    setLoading(false); // Hide loading indicator after response
  };

  return (
    <div className="chatbot-container">
      <div className="chatbox">
        {chatMessages.map((msg, index) => (
          <div key={index} className={msg.sender}>
            <p>{msg.text}</p>
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
          {loading ? "Loading..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
