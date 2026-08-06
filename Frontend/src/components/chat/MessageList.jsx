import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { getMessages } from "../../services/chatApi";
import MessageBubble from "./MessageBubble";
import TicTacToe from "./TicTacToe"; 

function MessageList({ socket, setMessages }) {
  const { messages, selectedChat } = useChat();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const isInitialLoad = useRef(true);

  // State to track the live multiplayer game session
  const [activeGame, setActiveGame] = useState(null);

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
    setActiveGame(null); // Clear game state when switching chats
  }, [selectedChat?._id, setMessages]);

  // 2. Auto-scroll behavior
  useEffect(() => {
    if (loading || !messages.length) return;

    if (isInitialLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      isInitialLoad.current = false;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // 3. Auto-mark messages as read
  useEffect(() => {
    if (!socket || !selectedChat || !messages.length || !user?._id) return;

    const unreadIncomingMessages = messages.filter(
      (m) => !m.isRead && (m.sender?._id || m.sender) !== user._id
    );

    if (unreadIncomingMessages.length > 0) {
      socket.emit("markAsRead", { 
        chatId: selectedChat._id, 
        readerId: user._id 
      });
      
      setMessages((prev) =>
        prev.map((m) =>
          !m.isRead && (m.sender?._id || m.sender) !== user._id
            ? { ...m, isRead: true }
            : m
        )
      );
    }
  }, [messages, socket, selectedChat, user?._id, setMessages]);

  // 4. Real-time socket listeners
  useEffect(() => {
    if (!socket) return;
    
    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => m._id === messageId ? { ...m, text: "This message was deleted", image: null, deletedForEveryone: true } : m)
      );
    };

    const handleReceiveMessage = (newMessage) => {
      const belongsToCurrentChat = selectedChat && (newMessage.chat === selectedChat._id || newMessage.chat?._id === selectedChat._id);
      if (belongsToCurrentChat) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    const handleMessagesRead = ({ chatId }) => {
      if (selectedChat?._id === chatId) {
        setMessages((prev) => prev.map((m) => (m.sender?._id || m.sender) === user?._id ? { ...m, isRead: true } : m));
      }
    };

    // --- LIVE GAME UPDATES LISTENER ---
    const handleGameUpdated = (updatedGame) => {
      if (selectedChat?._id === updatedGame.gameId) {
        setActiveGame(updatedGame);
      }
    };

    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("newMessage", handleReceiveMessage);
    socket.on("getMessage", handleReceiveMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("game-updated", handleGameUpdated); 

    return () => {
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("newMessage", handleReceiveMessage);
      socket.off("getMessage", handleReceiveMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("game-updated", handleGameUpdated);
    };
  }, [socket, setMessages, selectedChat, user?._id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-slate-50/50 dark:bg-[#0a192f]/50 backdrop-blur-sm gap-4 transition-colors duration-300">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse shadow-lg"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
        </div>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase animate-pulse">
          Syncing conversation...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2 bg-slate-50/40 dark:bg-[#0a192f]/40 backdrop-blur-sm transition-colors duration-300 scrollbar-thin scrollbar-thumb-slate-300/80 dark:scrollbar-thumb-slate-700/80">
      
      {/* --- ✅ FIXED: Remains open during won/draw states so players can interact with post-game buttons --- */}
      {activeGame && (
        <div className="w-full flex justify-center py-4 sticky top-0 z-30 animate-scale-up">
          <TicTacToe activeGame={activeGame} setActiveGame={setActiveGame} socket={socket} />
        </div>
      )}

      {messages.map((msg, index) => (
        <MessageBubble key={msg._id || index} message={msg} />
      ))}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}

export default MessageList;