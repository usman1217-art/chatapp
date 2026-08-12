import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

function ChatItem({ chat }) {
  const { selectedChat, setSelectedChat, setMessages } = useChat();
  const { user } = useAuth();

  const otherUser = chat.participants.find(
    (p) => (p._id || p) !== (user?._id || user)
  );

  const isSelected = selectedChat?._id === chat._id;

  const handleSelectChat = () => {
    if (selectedChat?._id === chat._id) return;
  
    // Create a history entry so Android back closes the chat
    window.history.pushState({ chatOpen: true }, "");
  
    setMessages([]);
    setSelectedChat(chat);
  };

  return (
    <div
      onClick={handleSelectChat}
      className={`p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-3 cursor-pointer transition-all duration-200 group ${
        isSelected 
        ? "bg-slate-100 dark:bg-slate-800/60 border-r-4 border-r-slate-900 dark:border-r-white" 
        : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || "User")}`}
          alt={otherUser?.name}
          className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold truncate ${isSelected ? "text-slate-900 dark:text-white text-glow" : "text-slate-700 dark:text-slate-200"}`}>
          {otherUser?.name || "Unknown User"}
        </h3>
        <p className={`text-sm truncate mt-0.5 ${isSelected ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
          {chat.lastMessage?.text || "No messages yet"}
        </p>
      </div>
    </div>
  );
}

export default ChatItem;