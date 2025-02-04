import { createContext, useContext, useState } from "react"; // Remove StreamChat


const StreamChatContext = createContext();

export const StreamChatProvider = ({ children }) => {
  const [client, setClient] = useState(null);

  return (
    <StreamChatContext.Provider value={{ client, setClient }}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => useContext(StreamChatContext);