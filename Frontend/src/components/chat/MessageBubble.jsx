import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";

function MessageBubble({ message }) {
  const { user } = useAuth();
  const { selectedChat, setMessages } = useChat();
  const { socket } = useSocket(); // Grab the socket connection
  
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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
        // Update your own screen
        setMessages((prev) =>
          prev.map((m) =>
            m._id === message._id
              ? { ...m, text: "This message was deleted", image: null, deletedForEveryone: true }
              : m
          )
        );

        // Tell the other person's screen to update in real-time
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
        if (!showMenu) setShowMenu(false);
      }}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-5 py-3 pr-9 shadow-md flex flex-col relative transition-colors duration-200 ${
          own
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-slate-800 border border-slate-700/80 text-slate-100 rounded-bl-sm"
        }`}
      >
        {!message.deletedForEveryone && (isHovered || showMenu) && (
          <div className="absolute top-2 right-2 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-slate-100 transition-colors cursor-pointer shadow-lg"
              title="Message options"
            >
              <svg className="w-4 h-4 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 top-9 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-40 text-xs font-medium"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDeleteForMe();
                  }}
                  className="w-full text-left px-4 py-2.5 text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Delete for me
                </button>

                {canDeleteForEveryone && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeleteForEveryone();
                    }}
                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-slate-800 transition-colors font-semibold"
                  >
                    Delete for everyone
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {message.image && !message.deletedForEveryone && (
          <img
            src={message.image}
            alt="Attachment"
            className="rounded-lg mb-2 max-w-full h-auto object-cover border border-white/10 shadow-sm"
          />
        )}

        <p className={`leading-relaxed whitespace-pre-wrap break-words text-sm md:text-base ${message.deletedForEveryone ? "italic text-slate-400" : ""}`}>
          {message.deletedForEveryone ? "This message was deleted" : message.text}
        </p>

        <span
          className={`text-[10px] block mt-1.5 self-end ${
            own ? "text-indigo-200" : "text-slate-400"
          }`}
        >
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

export default MessageBubble;