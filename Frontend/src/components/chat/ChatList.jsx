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

  // Modern Loading Spinner
  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center p-8 bg-transparent transition-colors duration-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  // Polished Empty State
  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent transition-colors duration-300">
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
    <div className="flex-1 overflow-y-auto bg-transparent scroll-smooth divide-y divide-slate-800/60">
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