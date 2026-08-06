import { useState } from "react"; // 👈 ADDED: useState for the dropdown menu
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

function ChatHeader({ onStartCall }) {
  const { selectedChat, setSelectedChat, setChats } = useChat();
  const { user } = useAuth();
  const { onlineUsers, isTyping, socket } = useSocket();
  
  // 👈 ADDED: State to control the game selection dropdown
  const [showGameMenu, setShowGameMenu] = useState(false);

  if (!selectedChat) return null;

  const otherUser = selectedChat.participants.find(
    (participant) => (participant._id || participant) !== (user?._id || user)
  );

  const isOnline = onlineUsers.includes(otherUser?._id);

  const handleDeleteChat = async () => {
    const chatId = selectedChat._id || selectedChat.id;

    if (!chatId) {
      alert("Error: Chat ID is missing!");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        setChats((prev) => prev.filter((chat) => (chat._id || chat.id) !== chatId));
        setSelectedChat(null);
      } else {
        alert(data.message || "Failed to delete chat");
      }
    } catch (err) {
      console.error("Error deleting chat network request:", err);
    }
  };

  // 👈 ADDED: Function to handle game selection and routing
  const startChallenge = (gameType) => {
    if (socket) {
      socket.emit("initiate-game", {
        chatId: selectedChat._id || selectedChat.id,
        player1Id: user._id || user,
        player2Id: otherUser._id || otherUser,
        gameType // Sends the specific game chosen to the backend
      });
    }
    setShowGameMenu(false); // Close menu after selecting
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#0a192f]/85 backdrop-blur-xl p-3 md:p-4 flex items-center justify-between transition-colors duration-300 z-10 shadow-sm shrink-0 w-full gap-2 relative">
      
      {/* Left side: Back Arrow, Avatar, and Status */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
        
        {/* Mobile Back Arrow (Hidden on Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedChat(null);
          }}
          className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer rounded-full active:scale-95 shrink-0"
          title="Back to Chats"
        >
          <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative shrink-0">
          <img
            src={
              otherUser?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                otherUser?.name || "User"
              )}&background=4f46e5&color=fff`
            }
            alt={otherUser?.name}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
          />
          
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 md:w-4 md:h-4 bg-emerald-500 border-2 border-white dark:border-[#0a192f] rounded-full shadow-sm"></span>
          )}
        </div>

        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h2 className="font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 leading-tight truncate">
            {otherUser?.name || "User"}
          </h2>
          
          <div className="flex items-center mt-0.5 h-4">
            {isTyping ? (
              <p className="text-xs md:text-sm font-bold text-indigo-600 dark:text-indigo-400 transition-colors flex items-center gap-1.5 tracking-wide">
                typing
                <span className="flex gap-0.5 items-center justify-center translate-y-[2px]">
                  <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" />
                  <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                </span>
              </p>
            ) : (
              <p
                className={`text-xs md:text-sm font-medium transition-colors truncate ${
                  isOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        
        {/* --- ✅ UPDATED: GAME CHALLENGE DROPDOWN BUTTON --- */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowGameMenu(!showGameMenu);
            }}
            className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
              showGameMenu 
                ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" 
                : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
            }`}
            title="Play a Game"
          >
            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12h4m-2-2v4m10-2h.01M16 10h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown Menu Panel */}
          {showGameMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl z-50 p-1.5 animate-[fade-in_0.2s_ease-out]">
              <div className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 py-2">
                Challenge to...
              </div>
              <button 
                onClick={() => startChallenge("tictactoe")} 
                className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>❌</span> Tic-Tac-Toe
              </button>
              <button 
                onClick={() => startChallenge("connect4")} 
                className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer flex items-center gap-2 mt-0.5"
              >
                <span>🔴</span> Connect Four
              </button>
              <button 
                onClick={() => startChallenge("rps")} 
                className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 rounded-lg transition-colors cursor-pointer flex items-center gap-2 mt-0.5"
              >
                <span>✊</span> Rock Paper Scissors
              </button>
            </div>
          )}
        </div>

        {/* --- VOICE CALL BUTTON --- */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onStartCall) onStartCall();
          }}
          className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
          title="Start Voice Call"
        >
          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>

        {/* Delete Chat Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteChat();
          }}
          className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
          title="Delete Chat"
        >
          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Close Chat Window Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedChat(null);
          }}
          className="hidden md:flex items-center justify-center p-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
          title="Close Chat"
        >
          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default ChatHeader;