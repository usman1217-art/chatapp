import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const [typingFrom, setTypingFrom] = useState(null);

  // Maintain atomic references to prevent event closures from tracking stale data.
  // FIX: this MUST be useRef, not useState. useState creates a brand-new array on
  // every render, so the listener registered once below (in the [socket] effect)
  // was reading a frozen/stale reference and never saw chat switches — meaning
  // incoming messages from the other person never appeared until you reopened
  // the chat. useRef gives one stable object whose .current always reflects the
  // latest selected chat.
  const chatRef = useRef(selectedChat);
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

    // FIX: the server now tells us WHO is typing and WHICH chat it's for
    // (see Backend/sockets/socket.js). Previously "typing" carried no
    // identifying info at all, so isTyping was flipped to true globally and
    // every open chat showed "typing..." no matter who was actually typing.
    socket.on("typing", ({ senderId, chatId } = {}) => {
      const currentChat = chatRef.current;
      if (currentChat && (chatId === currentChat._id || senderId)) {
        setTypingFrom(senderId || null);
      }
    });

    socket.on("stopTyping", ({ senderId, chatId } = {}) => {
      setTypingFrom((prev) => (prev === senderId || chatId ? null : prev));
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageRead");
      socket.off("messageDeleted");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, setMessages]);

  // Reset typing state whenever the active chat changes
  useEffect(() => {
    setTypingFrom(null);
  }, [selectedChat?._id]);

  // Only report "isTyping" if the person typing is actually the other
  // participant of the currently open chat.
  useEffect(() => {
    if (!typingFrom || !selectedChat) {
      setIsTyping(false);
      return;
    }
    const otherUserId = selectedChat.participants
      ?.map((p) => p._id || p)
      .find((id) => id !== user?._id);
    setIsTyping(typingFrom === otherUserId);
  }, [typingFrom, selectedChat, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);