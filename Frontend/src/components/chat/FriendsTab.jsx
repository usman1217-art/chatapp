import { useState, useEffect } from "react";
import { useChat } from "../../context/ChatContext";

function FriendsTab() {
  const [friends, setFriends] = useState([]);
  const { setSelectedChat, setChats, chats } = useChat();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/users/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFriends(data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  const handleUnfriend = async (friendId) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/users/friends/${friendId}`, {
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
      // Check if chat already exists in state or create a new conversation room via backend
      let existingChat = chats.find(c => 
        c.participants.some(p => (p._id || p) === friend._id)
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        return;
      }

      const res = await fetch("http://localhost:3000/api/chats", {
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
      console.error("Error starting chat with friend:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a192f]">
      <h2 className="text-slate-200 font-bold text-lg mb-4">My Friends</h2>
      {friends.length === 0 ? (
        <p className="text-slate-400 text-sm">No friends added yet.</p>
      ) : (
        friends.map((friend) => (
          <div
            key={friend._id}
            className="flex items-center justify-between p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
          >
            <div 
              className="flex items-center gap-3 cursor-pointer flex-1"
              onClick={() => handleStartChat(friend)}
            >
              <img
                src={
                  friend.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=4f46e5&color=fff`
                }
                alt={friend.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-600"
              />
              <div>
                <h4 className="text-slate-100 font-semibold text-sm">{friend.name}</h4>
                <p className="text-xs text-slate-400">Click to chat</p>
              </div>
            </div>

            <button
              onClick={() => handleUnfriend(friend._id)}
              className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors cursor-pointer"
            >
              Unfriend
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default FriendsTab;