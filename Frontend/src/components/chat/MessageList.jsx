import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { getMessages } from "../../services/chatApi";
import MessageBubble from "./MessageBubble";

function MessageList({ socket, setMessages }) {
  const { messages, selectedChat } = useChat();
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const isInitialLoad = useRef(true);

  // 1. Fetch initial chat history
  useEffect(() => {
    if (!selectedChat?._id) return;
    
    const fetchChatHistory = async () => {
      setLoading(true);
      isInitialLoad.current = true;
      try {
        const res = await getMessages(selectedChat._id);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [selectedChat?._id, setMessages]);

  // 2. Auto-scroll to bottom behavior
  useEffect(() => {
    if (loading || !messages.length) return;

    if (isInitialLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      isInitialLoad.current = false;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // 3. --- REAL-TIME SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket) return;
    
    // A. Handle Deleted Messages
    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, text: "This message was deleted", image: null, deletedForEveryone: true }
            : m
        )
      );
    };

    // B. Handle New Incoming Messages
    const handleReceiveMessage = (newMessage) => {
      // Check if the incoming message belongs to the currently active chat
      const belongsToCurrentChat = selectedChat && (newMessage.chat === selectedChat._id || newMessage.chat?._id === selectedChat._id);
      
      if (belongsToCurrentChat) {
        setMessages((prev) => {
          // Prevent duplicates (in case the server accidentally sends it twice or optimistic UI overlaps)
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    // Bind event listeners
    socket.on("messageDeleted", handleMessageDeleted);
    
    // We bind to the most common event names to ensure the frontend catches the backend's broadcast
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("newMessage", handleReceiveMessage);
    socket.on("getMessage", handleReceiveMessage);

    // Cleanup listeners on unmount or chat change
    return () => {
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("newMessage", handleReceiveMessage);
      socket.off("getMessage", handleReceiveMessage);
    };
  }, [socket, setMessages, selectedChat]);

  // Loading State UI
  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-slate-50 dark:bg-[#0a192f] gap-3 transition-colors duration-300">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
        </div>
        <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 tracking-widest uppercase animate-pulse">
          Syncing secure conversation...
        </span>
      </div>
    );
  }

  // Active Chat Messages UI
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-2 bg-slate-50 dark:bg-[#0a192f] transition-colors duration-300 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
      {messages.map((msg, index) => (
        <MessageBubble key={msg._id || index} message={msg} />
      ))}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}

export default MessageList;