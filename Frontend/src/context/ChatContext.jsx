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

  const [selectedChat, setSelectedChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  useEffect(() => {

    if (!selectedChat) return;

    loadMessages();

  }, [selectedChat]);

  const loadMessages = async () => {

    try {

      const res =
        await getMessages(selectedChat._id);

      setMessages(res.data);

    }

    catch (err) {

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
      }}
    >

      {children}

    </ChatContext.Provider>

  );

};

export const useChat = () =>
  useContext(ChatContext);