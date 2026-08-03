import { createContext, useContext, useEffect, useState } from "react";
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

  // Maintain atomic references to prevent event closures from tracking stale data
  const chatRef = useState(selectedChat);
  useEffect(() => { chatRef.current = selectedChat; }, [selectedChat]);

  // Handle core socket instantiation
  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000");
    newSocket.emit("join", user._id);

    newSocket.on("onlineUsers", (users) => setOnlineUsers(users));
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Handle dynamic real-time event updates
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      const currentChat = chatRef.current;
      // Only commit message to screen if it belongs to the currently active window
      if (currentChat && message.chat === currentChat._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on("messageRead", (messageId) => {
      setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, read: true } : m));
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, text: "This message was deleted", image: null, deletedForEveryone: true }
            : m
        )
      );
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.off("receiveMessage");
      socket.off("messageRead");
      socket.off("messageDeleted");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, setMessages]);

  useEffect(() => {
    setIsTyping(false);
  }, [selectedChat?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);