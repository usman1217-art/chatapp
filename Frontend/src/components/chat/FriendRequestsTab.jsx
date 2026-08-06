import { useEffect, useState } from "react";

function FriendRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friend-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (senderId) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friend-request/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senderId }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== senderId));
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleDelete = async (senderId) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friend-request/${senderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== senderId));
      }
    } catch (err) {
      console.error("Error deleting request:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-[#0a192f] transition-colors duration-300">
      <h3 className="text-slate-800 dark:text-slate-100 font-bold text-sm mb-2">Pending Requests</h3>
      
      {/* ✅ Premium Skeleton Loader tracking FriendTab / ChatList structure */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Avatar Skeleton */}
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                
                {/* Text Skeletons */}
                <div className="space-y-2 flex-1 max-w-[140px]">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700/60 rounded-md w-1/2" />
                </div>
              </div>
              
              {/* Action Buttons Skeletons */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-14 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="w-14 h-8 bg-slate-200 dark:bg-slate-700/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-xs animate-[fade-in_0.3s_ease-out]">No pending friend requests.</p>
      ) : (
        <div className="space-y-3 animate-[fade-in_0.25s_ease-out]">
          {requests.map((reqUser) => (
            <div
              key={reqUser._id}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <img
                  src={reqUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reqUser.name)}&background=4f46e5&color=fff`}
                  alt={reqUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-slate-900 dark:text-slate-100 font-semibold text-sm truncate">{reqUser.name}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono truncate">{reqUser.userId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAccept(reqUser._id)}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDelete(reqUser._id)}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition-all cursor-pointer border border-red-200 dark:border-transparent active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendRequestsTab;