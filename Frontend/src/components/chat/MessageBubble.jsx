import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";
import { FaFileAlt, FaDownload, FaRegSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

function MessageBubble({ message }) {
  const { user } = useAuth();
  const { selectedChat, setMessages, setReplyingTo, setActiveLightboxImage } = useChat();
  const { socket } = useSocket();
  
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const menuRef = useRef(null);
  const emojiPickerRef = useRef(null);

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
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTouchStart = (e) => {
    if (message.deletedForEveryone) return;
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
              ? { ...m, text: "This message was deleted", image: null, fileUrl: null, deletedForEveryone: true }
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

  const handleReact = async (emoji) => {
    setShowEmojiPicker(false);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/messages/${message._id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (res.ok) {
        const updatedMessage = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? updatedMessage : m))
        );

        if (socket && selectedChat) {
          const receiver = selectedChat.participants.find(p => (p._id || p) !== user._id);
          if (receiver) {
            socket.emit("reactionAdded", { 
              message: updatedMessage,
              receiverId: receiver._id || receiver 
            });
          }
        }
      }
    } catch (err) {
      console.error("Error reacting to message:", err);
    }
  };

  const handleScrollToMessage = (targetId) => {
    const element = document.getElementById(`message-${targetId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-slate-200", "dark:bg-white/20");
      setTimeout(() => {
        element.classList.remove("bg-slate-200", "dark:bg-white/20");
      }, 1500); 
    }
  };

  return (
    <div 
      id={`message-${message._id}`} 
      className={`flex ${own ? "justify-end" : "justify-start"} px-4 py-1.5 relative rounded-2xl transition-colors duration-700`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!message.deletedForEveryone && (
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 p-2 rounded-full transition-opacity duration-200"
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
        className={`max-w-[85%] md:max-w-[70%] rounded-3xl px-5 py-3.5 shadow-lg flex flex-col relative z-10 ${isSwiping.current ? 'duration-0' : 'duration-300'} ${
          own
            ? "bg-slate-500 text-white rounded-br-sm shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)] backdrop-blur-md font-bold border border-white/20"
            : "glass border-white/10 text-slate-100 rounded-bl-sm font-medium"
        }`}
      >
        {!message.deletedForEveryone && (isHovered || showMenu) && (
          <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
            <div className="flex items-center gap-1 bg-black/30 dark:bg-black/60 backdrop-blur-md rounded-full p-1 shadow-lg">
              {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="p-1 rounded-full hover:bg-white/20 transition-all text-sm cursor-pointer hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                >
                  <FaRegSmile className="w-3.5 h-3.5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full right-0 mt-2 z-50 shadow-2xl rounded-2xl overflow-hidden animate-slide-up">
                    <EmojiPicker
                      onEmojiClick={(e) => handleReact(e.emoji)}
                      theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-black/10 dark:bg-black/30 backdrop-blur-md rounded-full p-0.5 ml-1">
              <button 
                onClick={() => setReplyingTo(message)}
                className="hidden md:block p-1.5 rounded-full transition-colors cursor-pointer text-white hover:bg-white/20"
                title="Reply"
              >
                <svg className="w-3.5 h-3.5 drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(true);
                }}
                className="p-1.5 rounded-full transition-colors cursor-pointer text-white hover:bg-white/20"
                title="Message options"
              >
                <svg className="w-4 h-4 pointer-events-none drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {message.replyTo && (
          <div 
            onClick={() => handleScrollToMessage(message.replyTo._id || message.replyTo)} 
            className={`border-l-4 p-2 rounded-md mb-2 text-xs max-w-full truncate backdrop-blur-sm cursor-pointer opacity-90 hover:opacity-100 transition-opacity ${
              own ? "bg-white/20 border-white/50 text-white" : "bg-slate-200/50 dark:bg-slate-900/50 border-slate-400 text-slate-800 dark:text-slate-200"
            }`}
          >
            {message.replyTo.text || "📷 Media Attachment"}
          </div>
        )}

        {message.image && !message.deletedForEveryone && (
          <img
            src={message.image}
            alt="Attachment"
            onClick={() => setActiveLightboxImage(message.image)}
            className="rounded-xl mb-2 max-w-full h-auto max-h-56 object-cover shadow-sm cursor-zoom-in hover:scale-[1.01] transition-transform duration-200 border-2 border-white/20"
          />
        )}

        {message.fileUrl && !message.deletedForEveryone && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors cursor-pointer border ${
              own 
                ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
                : "bg-slate-200/50 hover:bg-slate-300/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            }`}
          >
            <div className={`p-2 rounded-lg ${own ? "bg-white/20" : "bg-slate-300 dark:bg-slate-700"}`}>
              <FaFileAlt className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold truncate">{message.fileName || "Attachment"}</span>
            </div>
            <FaDownload className="w-4 h-4 opacity-70" />
          </a>
        )}

        <p className={`leading-relaxed whitespace-pre-wrap break-words text-sm md:text-base font-medium ${
          message.deletedForEveryone 
            ? own ? "italic text-slate-200" : "italic text-slate-500 dark:text-slate-400 font-normal" 
            : ""
        }`}>
          {message.deletedForEveryone ? "This message was deleted" : message.text}
        </p>

        {/* --- TIMESTAMP AND READ RECEIPTS ROW --- */}
        <div className="flex items-center justify-end gap-1.5 mt-1.5">
          <span
            className={`text-[10px] font-bold tracking-wider ${
              own ? "text-slate-200" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {new Date(message.createdAt || Date.now()).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
          
          {/* 🔴 FIX: ONLY show the read receipt checkmarks wrapper if the message belongs to YOU */}
          {own && !message.deletedForEveryone && (
            <div className="flex -ml-0.5">
              <svg 
                className={`w-3.5 h-3.5 ${message.read ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {message.read && (
                <svg 
                  className="w-3.5 h-3.5 text-emerald-400 -ml-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
          )}
        </div>
        
        {/* REACTION BADGES */}
        {message.reactions && message.reactions.length > 0 && !message.deletedForEveryone && (
          <div className={`absolute -bottom-3 flex flex-wrap gap-1 z-20 ${own ? 'right-2' : 'left-2'}`}>
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {})
            ).map(([emoji, count]) => (
              <div 
                key={emoji}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => handleReact(emoji)}
              >
                <span>{emoji}</span>
                {count > 1 && <span>{count}</span>}
              </div>
            ))}
          </div>
        )}

      </div>

      {showMenu && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false); 
          }}
        >
          <div 
            className="glass-panel w-full max-w-[300px] rounded-3xl shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] border border-white/20 flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h3 className="font-black text-slate-100 text-sm uppercase tracking-widest text-glow">Options</h3>
              <button 
                onClick={() => setShowMenu(false)} 
                className="text-slate-400 hover:text-white text-2xl leading-none transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDeleteForMe();
                }}
                className="w-full text-center px-4 py-3.5 bg-white/5 hover:bg-white/10 text-slate-100 font-bold rounded-2xl transition-colors shadow-sm cursor-pointer border border-white/5"
              >
                Delete for me
              </button>

              {canDeleteForEveryone && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDeleteForEveryone();
                  }}
                  className="w-full text-center px-4 py-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-2xl border border-red-500/30 transition-colors shadow-sm cursor-pointer"
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