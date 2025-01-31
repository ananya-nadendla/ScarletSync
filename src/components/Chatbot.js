import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Import Firestore and Auth
import { doc, onSnapshot } from "firebase/firestore"; // Firestore functions

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // State to hold user profile data

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

  // Function to send message to backend
  const sendMessage = async (message) => {
    setLoading(true); // Show loading indicator while waiting for response

    if (userProfile) {
      try {
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
            rutgersInfo: {
              courses: { CS101: "Intro to Computer Science" }, // Replace with actual Rutgers data
            },
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
