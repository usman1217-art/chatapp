import { useState } from "react";
import { Link } from "react-router-dom";
import ChatList from "./ChatList";
import FriendsTab from "./FriendsTab";
import FriendRequestsTab from "./FriendRequestsTab";
import UserSearch from "../search/UserSearch";
import { useAuth } from "../../context/AuthContext"; 

function ChatSidebar() {
  const [openSearch, setOpenSearch] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // 'chats', 'friends', or 'requests'
  const { user } = useAuth(); 

  const displayAvatar = user?.avatar 
    ? user.avatar 
    : `https://ui-avatars.com/api/?name=${user?.name || "?"}&background=4f46e5&color=fff`;

  return (
    <div className="w-80 relative overflow-hidden border-r border-slate-800 flex flex-col bg-[#0a192f] transition-colors duration-300 h-full">
      
      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-5 border-b border-slate-800">
        
        <div className="flex items-center gap-3">
          {/* Dynamic Profile Icon Link */}
          <Link 
            to="/profile" 
            title="Go to Profile"
            className="relative group block rounded-full overflow-hidden border-2 border-slate-700 hover:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md shrink-0 bg-slate-800"
          >
            <img 
              src={displayAvatar} 
              alt={user?.name || "Profile"} 
              className="w-10 h-10 object-cover"
            />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          <h2 className="text-2xl font-bold text-slate-100">
            Messages
          </h2>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => setOpenSearch(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl pb-1 transition-all shadow-sm hover:shadow-md shrink-0 cursor-pointer"
          title="Find User by ID"
        >
          +
        </button>
      </div>

      {/* Tabs Switcher Bar (Chats | Friends | Requests) */}
      <div className="flex border-b border-slate-800 p-2 gap-1 bg-[#0a192f]">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "chats"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "friends"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "requests"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          Requests
        </button>
      </div>
      
      {/* Conditional Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "chats" && (
          <div className="flex-1 overflow-y-auto">
            <ChatList />
          </div>
        )}
        {activeTab === "friends" && <FriendsTab />}
        {activeTab === "requests" && <FriendRequestsTab />}
      </div>

      {/* Search Modal Overlay */}
      {openSearch && (
        <UserSearch close={() => setOpenSearch(false)} />
      )}
    </div>
  );
}

export default ChatSidebar;