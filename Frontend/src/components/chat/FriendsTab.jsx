import { useState, useEffect } from "react";
import { useChat } from "../../context/ChatContext";

function FriendsTab() {
  const [friends, setFriends] = useState([]);
  // ✅ Added loading state initialized to true
  const [loading, setLoading] = useState(true);
  const { setSelectedChat, setChats, chats } = useChat();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true); // Ensure loading triggers on refetch sequences
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFriends(data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false); // ✅ Turn off loader when response finishes
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f._id !== friendId));
      }
    } catch (err) {
      console.error("Error unfriending:", err);
    }
  };

  const handleStartChat = async (friend) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      let existingChat = chats.find(c => 
        c.participants.some(p => (p._id || p) === friend._id)
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: friend._id }),
      });

      const newChat = await res.json();
      if (res.ok) {
        setChats((prev) => [newChat, ...prev]);
        setSelectedChat(newChat);
      }
    } catch (err) {
      console.error("Error start chat with friend:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent transition-colors duration-300">
      <h2 className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-4">My Friends</h2>
      
      {/* ✅ OPTION A: RENDER DYNAMIC SKELETON LOADER PLACEMENT WHILE FETCHING */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Avatar Skeleton */}
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                
                {/* Text Skeletons */}
                <div className="space-y-2 flex-1 max-w-[150px]">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700/60 rounded-md w-1/2" />
                </div>
              </div>
              
              {/* Button Skeleton */}
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      ) : friends.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm animate-[fade-in_0.3s_ease-out]">No friends added yet.</p>
      ) : (
        <div className="space-y-3 animate-[fade-in_0.25s_ease-out]">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all shadow-sm group"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => handleStartChat(friend)}
              >
                <img
                  src={
                    friend.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}`
                  }
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 transition-transform duration-200 group-hover:scale-105"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{friend.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Click to chat</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent launching chat window when clicking delete
                  handleUnfriend(friend._id);
                }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
              >
                Unfriend
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendsTab;