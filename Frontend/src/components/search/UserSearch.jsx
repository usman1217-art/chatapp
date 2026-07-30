import { useState } from "react";
import { useChat } from "../../context/ChatContext";

function UserSearch({ close }) {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [error, setError] = useState("");
  
  // Custom notification state
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const { setSelectedChat, chats, setChats } = useChat();

  const showNotification = (text, type = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setRequestSent(false);

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:3000/api/users/search?userId=${encodeURIComponent(searchId.trim())}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errData = await response.json();
        setError(errData.message || "User not found.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!result) return;
    setIsSendingRequest(true);

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/users/friend-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendId: result._id }),
      });

      if (response.ok) {
        setRequestSent(true);
        showNotification("Friend request sent successfully!", "success");
      } else {
        const errData = await response.json();
        showNotification(errData.message || "Failed to send request.", "error");
      }
    } catch (error) {
      showNotification("Network error. Could not send request.", "error");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleStartChat = async () => {
    if (!result) return;
    setIsStartingChat(true);

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      const response = await fetch("http://localhost:3000/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: result._id }), 
      });

      if (response.ok) {
        const chatData = await response.json();
        
        if (chats && !chats.find((c) => c._id === chatData._id)) {
          setChats([chatData, ...chats]);
        } else if (!chats) {
          setChats([chatData]);
        }
        
        setSelectedChat(chatData);
        close(); 
      } else {
        const errData = await response.json();
        setError(errData.message || "Failed to start chat.");
      }
    } catch (error) {
      setError("Network error. Could not start chat.");
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur-md flex flex-col transition-colors duration-300">
      
      {/* Custom Notification Toast */}
      {statusMessage.text && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg border backdrop-blur-md animate-bounce transition-all ${
          statusMessage.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="flex justify-between items-center p-5 border-b border-slate-300 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Find User
        </h3>
        <button 
          onClick={close} 
          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 pb-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="User ID (e.g. CHAT-XXXXXX)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 uppercase"
            autoFocus
          />
          <button 
            type="submit" 
            disabled={loading || !searchId.trim()} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-sm cursor-pointer"
          >
            {loading ? "..." : "Find"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3 font-medium px-1">{error}</p>}
      </div>

      {result && (
        <div className="p-5 pt-3 flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            
            <img
              src={result.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name)}&background=4f46e5&color=fff&size=256`}
              alt={result.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-600"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">
                {result.name}
              </h4>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 font-mono mt-0.5">
                {result.userId}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {result.about || "Hey there! I am using Chat App."}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {requestSent ? (
                <span className="text-xs text-slate-400 px-3 py-1 bg-slate-700/30 rounded-lg">
                  Request Sent
                </span>
              ) : (
                <button 
                  onClick={handleSendFriendRequest}
                  disabled={isSendingRequest}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSendingRequest ? "Sending..." : "Add Friend"}
                </button>
              )}

              <button 
                onClick={handleStartChat}
                disabled={isStartingChat}
                className="p-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait cursor-pointer"
              >
                {isStartingChat ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default UserSearch;