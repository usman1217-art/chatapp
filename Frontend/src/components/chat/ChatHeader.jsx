import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

function ChatHeader() {
  const { selectedChat, setSelectedChat, setChats } = useChat();
  const { user } = useAuth();
  const { onlineUsers, isTyping } = useSocket();

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

      console.log("Sending delete request for chat ID:", chatId);

      const res = await fetch(`http://localhost:3000/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Delete response status:", res.status, data);

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

  return (
    <div className="border-b border-slate-800 bg-[#0a192f]/90 backdrop-blur-md p-4 flex items-center justify-between transition-colors duration-300 z-10 shadow-sm shrink-0">
      
      {/* Left side: Avatar and Status */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={
              otherUser?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                otherUser?.name || "User"
              )}&background=4f46e5&color=fff`
            }
            alt={otherUser?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-sm bg-slate-800"
          />
          
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0a192f] rounded-full"></span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="font-bold text-lg text-slate-100 leading-tight">
            {otherUser?.name || "User"}
          </h2>
          
          <p
            className={`text-sm font-medium mt-0.5 transition-colors flex items-center gap-1 ${
              isTyping
                ? "text-indigo-400"
                : isOnline
                ? "text-green-400"
                : "text-slate-400"
            }`}
          >
            {isTyping ? (
              <>
                typing
                <span className="flex gap-0.5">
                  <span className="typing-dot w-1 h-1 rounded-full bg-indigo-400 inline-block" />
                  <span className="typing-dot w-1 h-1 rounded-full bg-indigo-400 inline-block" />
                  <span className="typing-dot w-1 h-1 rounded-full bg-indigo-400 inline-block" />
                </span>
              </>
            ) : isOnline ? (
              "Online"
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Delete Chat Button */}
        <button
          onClick={handleDeleteChat}
          className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 cursor-pointer"
          title="Delete Chat"
        >
          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Close Chat Window Button */}
        <button
          onClick={() => setSelectedChat(null)}
          className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer"
          title="Close Chat"
        >
          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default ChatHeader;