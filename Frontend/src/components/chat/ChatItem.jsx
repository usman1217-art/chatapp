import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

function ChatItem({ chat }) {
  const { selectedChat, setSelectedChat } = useChat();
  const { user } = useAuth();

  const otherUser = chat.participants.find(
    (p) => (p._id || p) !== (user?._id || user)
  );

  const isSelected = selectedChat?._id === chat._id;

  return (
    <div
      onClick={() => setSelectedChat(chat)}
      className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 border-b border-slate-800/60 ${
        isSelected
          ? "bg-indigo-600/20 border-r-4 border-r-indigo-500 text-white" 
          : "hover:bg-[#102542] text-slate-300" // Lighter navy shade on hover
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={
            otherUser?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              otherUser?.name || "User"
            )}&background=4f46e5&color=fff`
          }
          alt={otherUser?.name}
          className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-700 bg-slate-800"
        />
      </div>

      {/* Name and Latest Message */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-100 truncate">
          {otherUser?.name || "Unknown User"}
        </h3>
        <p className={`text-sm truncate mt-0.5 ${isSelected ? "text-indigo-400 font-medium" : "text-slate-400"}`}>
          {chat.lastMessage?.text || "No messages yet"}
        </p>
      </div>
    </div>
  );
}

export default ChatItem;