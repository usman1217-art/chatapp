import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { setMessages, selectedChat } = useChat();

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"
    );

    newSocket.emit("join", user._id);

    // Online users list
    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Receive New Message
    newSocket.on("receiveMessage", (message) => {
      setMessages((prev) => {
        const exist = prev.find(
          (m) => m._id === message._id
        );

        if (exist) return prev;

        return [...prev, message];
      });
    });

    // Message Read
    newSocket.on("messageRead", (messageId) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, read: true }
            : m
        )
      );
    });

    // Delete For Everyone Real-time Sync
    newSocket.on("messageDeleted", (messageId) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                text: "This message was deleted",
                image: null,
                deletedForEveryone: true,
              }
            : m
        )
      );
    });

    // Typing indicator (scoped to whichever chat is currently open)
    newSocket.on("typing", () => {
      setIsTyping(true);

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    });

    newSocket.on("stopTyping", () => {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, setMessages]);

  // Reset the indicator whenever the open chat changes
  useEffect(() => {
    setIsTyping(false);
  }, [selectedChat?._id]);

  return (
    <SocketContext.Provider
      value={{ socket, onlineUsers, isTyping }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () =>
  useContext(SocketContext);
