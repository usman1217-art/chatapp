import { useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { getChats } from "../../services/chatApi";
import ChatItem from "./ChatItem";

function ChatList() {
  const { chats, setChats } = useChat();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await getChats();
      setChats(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Premium Skeleton Loader matching FriendsTab structure
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm animate-pulse"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar Circle Skeleton */}
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              
              {/* Info Text Skeletons */}
              <div className="space-y-2 flex-1 max-w-[180px]">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
                <div className="h-2.5 bg-slate-200 dark:bg-slate-700/60 rounded-md w-1/2" />
              </div>
            </div>
            
            {/* Timestamp/Badge Area Skeleton */}
            <div className="w-10 h-3 bg-slate-200 dark:bg-slate-700/50 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // Polished Empty State
  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent transition-colors duration-300 animate-[fade-in_0.3s_ease-out]">
        <p className="text-sm font-medium text-slate-300">
          No chats yet.
        </p>
        <p className="text-xs mt-1 text-slate-400">
          Click the + button to find someone!
        </p>
      </div>
    );
  }

  // List Container matching the dark navy backdrop
  return (
    <div className="flex-1 overflow-y-auto bg-transparent scroll-smooth divide-y divide-slate-800/60 animate-[fade-in_0.25s_ease-out]">
      {chats.map((chat) => (
        <ChatItem 
          key={chat._id} 
          chat={chat} 
        />
      ))}
    </div>
  );
}

export default ChatList;