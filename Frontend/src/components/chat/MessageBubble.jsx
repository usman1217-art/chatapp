import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";

function MessageBubble({ message }) {
  const { user } = useAuth();
  const { selectedChat, setMessages, setReplyingTo, setActiveLightboxImage } = useChat();
  const { socket } = useSocket();
  
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // --- SWIPE GESTURE STATE ---
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const isSwiping = useRef(false);

  const senderId = message.sender?._id || message.sender;
  const own = senderId === user?._id;

  const canDeleteForEveryone =
    own && (Date.now() - new Date(message.createdAt).getTime()) / 1000 / 60 <= 15;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- TOUCH HANDLERS (Disabled for deleted messages) ---
  const handleTouchStart = (e) => {
    if (message.deletedForEveryone) return; // Prevent swiping if deleted
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isSwiping.current || message.deletedForEveryone) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    
    if (diff > 0 && diff <= 60) {
      setSwipeX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (message.deletedForEveryone) return;
    isSwiping.current = false;
    if (swipeX > 40) {
      setReplyingTo(message);
    }
    setSwipeX(0); 
  };
  // -------------------------------------------------------

  const handleDeleteForMe = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/messages/delete-me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: message._id }),
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== message._id));
      }
    } catch (err) {
      console.error("Error deleting for me:", err);
    }
  };

  const handleDeleteForEveryone = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/messages/delete-everyone`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: message._id }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === message._id
              ? { ...m, text: "This message was deleted", image: null, deletedForEveryone: true }
              : m
          )
        );

        if (socket && selectedChat) {
          const receiver = selectedChat.participants.find(p => (p._id || p) !== user._id);
          if (receiver) {
            socket.emit("deleteMessage", { 
              messageId: message._id, 
              receiverId: receiver._id || receiver 
            });
          }
        }
      }
    } catch (err) {
      console.error("Error deleting for everyone:", err);
    }
  };

  return (
    <div 
      className={`flex ${own ? "justify-end" : "justify-start"} px-4 py-1.5 relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Hidden Reply Icon that reveals on swipe */}
      {!message.deletedForEveryone && (
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 p-2 rounded-full transition-opacity duration-200"
          style={{ opacity: swipeX > 20 ? 1 : 0 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeX}px)` }}
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 pr-9 shadow-sm flex flex-col relative z-10 ${isSwiping.current ? 'duration-0' : 'duration-300'} ${
          own
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-sm"
        }`}
      >
        {/* Actions Trigger UI */}
        {!message.deletedForEveryone && (isHovered || showMenu) && (
          <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
            {/* Desktop Reply Button */}
            <button 
              onClick={() => setReplyingTo(message)}
              className={`hidden md:block p-1 rounded-full transition-colors cursor-pointer ${
                own ? "bg-black/20 hover:bg-black/40 text-white" : "bg-slate-100 hover:bg-slate-200 dark:bg-black/40 dark:hover:bg-black/60 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              }`}
              title="Reply"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>

            {/* Menu Dropdown Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(true);
              }}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                own ? "bg-black/20 hover:bg-black/40 text-white" : "bg-slate-100 hover:bg-slate-200 dark:bg-black/40 dark:hover:bg-black/60 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              }`}
              title="Message options"
            >
              <svg className="w-4 h-4 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        )}

        {/* Reply Quote Preview */}
        {message.replyTo && (
          <div className={`border-l-4 p-2 rounded-md mb-2 text-xs opacity-80 max-w-full truncate ${
            own ? "bg-black/20 border-indigo-300 text-slate-100" : "bg-slate-100 dark:bg-black/20 border-indigo-500 dark:border-indigo-400 text-slate-700 dark:text-slate-200"
          }`}>
            {message.replyTo.text || "📷 Media Attachment"}
          </div>
        )}

        {message.image && !message.deletedForEveryone && (
          <img
            src={message.image}
            alt="Attachment"
            onClick={() => setActiveLightboxImage(message.image)}
            className="rounded-lg mb-2 max-w-full h-auto max-h-48 object-cover border border-black/5 dark:border-white/10 shadow-sm cursor-zoom-in hover:scale-[1.01] transition-transform duration-150"
          />
        )}

        <p className={`leading-relaxed whitespace-pre-wrap break-words text-sm md:text-base ${
          message.deletedForEveryone 
            ? own ? "italic text-indigo-200" : "italic text-slate-500 dark:text-slate-400" 
            : ""
        }`}>
          {message.deletedForEveryone ? "This message was deleted" : message.text}
        </p>

        <span
          className={`text-[10px] block mt-1.5 self-end font-medium ${
            own ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* --- TELEPORTED FULL SCREEN MODAL --- */}
      {showMenu && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false); 
          }}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight">Message Options</h3>
              <button 
                onClick={() => setShowMenu(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-2xl leading-none transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body / Actions (Cancel Button Removed) */}
            <div className="p-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDeleteForMe();
                }}
                className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Delete for me
              </button>

              {canDeleteForEveryone && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDeleteForEveryone();
                  }}
                  className="w-full text-center px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-900/50 transition-colors shadow-sm cursor-pointer"
                >
                  Delete for everyone
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default MessageBubble;