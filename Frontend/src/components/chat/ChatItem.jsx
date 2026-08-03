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
    setMessages([]); // Wipes state immediately to kill flash artifact
    setSelectedChat(chat);
  };

  return (
    <div
      onClick={handleSelectChat}
      className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 border-b border-slate-200 dark:border-slate-800/60 ${
        isSelected
          ? "bg-indigo-50 dark:bg-indigo-600/20 border-r-4 border-r-indigo-600 dark:border-r-indigo-500" 
          : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || "User")}&background=4f46e5&color=fff`}
          alt={otherUser?.name}
          className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold truncate ${isSelected ? "text-indigo-900 dark:text-slate-100" : "text-slate-800 dark:text-slate-200"}`}>
          {otherUser?.name || "Unknown User"}
        </h3>
        <p className={`text-sm truncate mt-0.5 ${isSelected ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
          {chat.lastMessage?.text || "No messages yet"}
        </p>
      </div>
    </div>
  );
}

export default ChatItem;