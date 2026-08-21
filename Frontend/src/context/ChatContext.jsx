import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMessages } from "../services/chatApi";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [drafts, setDrafts] = useState({});

  // --- NEW ADVANCED FEATURE STATES ---
  const [replyingTo, setReplyingTo] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  // ------------------------------------

  useEffect(() => {
    if (!selectedChat) return;

    loadMessages();
    
    // Reset auxiliary presentation layers whenever a user switches chats
    setReplyingTo(null);
    setViewingProfile(false);
  }, [selectedChat]);

  const loadMessages = async () => {
    try {
      const res = await getMessages(selectedChat._id);
      setMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        messages,
        setMessages,
        drafts,
        setDrafts,
        // Expose new state hooks globally
        replyingTo,
        setReplyingTo,
        viewingProfile,
        setViewingProfile,
        activeLightboxImage,
        setActiveLightboxImage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);