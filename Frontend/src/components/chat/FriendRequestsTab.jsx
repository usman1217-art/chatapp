import { useState, useEffect } from "react";

function FriendRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/users/friend-requests", {
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
      const res = await fetch("http://localhost:3000/api/users/friend-request/accept", {
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
      const res = await fetch(`http://localhost:3000/api/users/friend-request/${senderId}`, {
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

  if (loading) return <p className="text-slate-400 text-sm text-center p-4">Loading...</p>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a192f]">
      <h3 className="text-slate-100 font-bold text-sm mb-2">Pending Requests</h3>
      {requests.length === 0 ? (
        <p className="text-slate-400 text-xs">No pending friend requests.</p>
      ) : (
        requests.map((reqUser) => (
          <div
            key={reqUser._id}
            className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <img
                src={reqUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reqUser.name)}&background=4f46e5&color=fff`}
                alt={reqUser.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-600"
              />
              <div>
                <h4 className="text-slate-100 font-semibold text-sm">{reqUser.name}</h4>
                <p className="text-xs text-indigo-400 font-mono">{reqUser.userId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAccept(reqUser._id)}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Accept
              </button>
              <button
                onClick={() => handleDelete(reqUser._id)}
                className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default FriendRequestsTab;