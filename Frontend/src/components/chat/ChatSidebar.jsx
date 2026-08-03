import { useState } from "react";
import { Link } from "react-router-dom";
import ChatList from "./ChatList";
import FriendsTab from "./FriendsTab";
import FriendRequestsTab from "./FriendRequestsTab";
import UserSearch from "../search/UserSearch";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useAppTheme } from "../../context/ThemeContext";

function ChatSidebar() {
  const [openSearch, setOpenSearch] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // 'chats', 'friends', or 'requests'
  
  const { user } = useAuth();
  const { selectedChat } = useChat();
  const { theme, toggleTheme } = useAppTheme();

  const displayAvatar = user?.avatar 
    ? user.avatar 
    : `https://ui-avatars.com/api/?name=${user?.name || "?"}&background=4f46e5&color=fff`;

  return (
    <div 
      className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-80 relative overflow-hidden md:border-r border-slate-200 dark:border-slate-800 flex-col bg-slate-50 dark:bg-[#0a192f] transition-colors duration-300 h-[100dvh] md:h-full text-slate-800 dark:text-slate-100`}
    >
      
      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {/* Dynamic Profile Icon Link (Hidden on mobile) */}
          <Link 
            to="/profile" 
            title="Go to Profile"
            className="hidden md:block relative group rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md shrink-0 bg-slate-200 dark:bg-slate-800"
          >
            <img 
              src={displayAvatar} 
              alt={user?.name || "Profile"} 
              className="w-10 h-10 object-cover"
            />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
            Messages
          </h2>
        </div>

        {/* Action Controls Side Header Layout */}
        <div className="flex items-center gap-2">
          {/* Desktop Layout Theme Switch Button */}
          <button
            onClick={toggleTheme}
            className="hidden md:flex bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full w-9 h-9 md:w-10 md:h-10 transition-colors shadow-sm cursor-pointer items-center justify-center text-base"
            title="Toggle Application Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* New Chat/Search Button */}
          <button
            onClick={() => setOpenSearch(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl pb-1 transition-all shadow-sm hover:shadow-md shrink-0 cursor-pointer"
            title="Find User by ID"
          >
            +
          </button>
        </div>
      </div>

      {/* Desktop Tabs Switcher Bar (Hidden on Mobile) */}
      <div className="hidden md:flex border-b border-slate-200 dark:border-slate-800 p-2 gap-1 bg-slate-100/50 dark:bg-[#0a192f] shrink-0">
        {["chats", "friends", "requests"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Conditional Content Area (Chats | Friends | Requests) */}
      <div className="flex-1 overflow-hidden flex flex-col pb-16 md:pb-0"> 
        {activeTab === "chats" && <div className="flex-1 overflow-y-auto"><ChatList /></div>}
        {activeTab === "friends" && <FriendsTab />}
        {activeTab === "requests" && <FriendRequestsTab />}
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-slate-50/95 dark:bg-[#0a192f]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-20 pb-safe shadow-lg transition-colors duration-300">
        
        <button onClick={() => setActiveTab("chats")} className={`flex flex-col items-center p-2 transition-colors cursor-pointer ${activeTab === "chats" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
          <svg className="w-6 h-6 mb-0.5" fill={activeTab === "chats" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[10px] font-bold">Chats</span>
        </button>

        <button onClick={() => setActiveTab("friends")} className={`flex flex-col items-center p-2 transition-colors cursor-pointer ${activeTab === "friends" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
          <svg className="w-6 h-6 mb-0.5" fill={activeTab === "friends" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-[10px] font-bold">Friends</span>
        </button>

        {/* Mobile View Central Theme Trigger */}
        <button 
          onClick={toggleTheme} 
          className="flex flex-col items-center p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
        >
          <span className="text-xl mb-0.5 leading-none">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span className="text-[10px] font-bold">Theme</span>
        </button>

        <button onClick={() => setActiveTab("requests")} className={`flex flex-col items-center p-2 transition-colors cursor-pointer ${activeTab === "requests" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
          <svg className="w-6 h-6 mb-0.5" fill={activeTab === "requests" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m-3-3v3m6-3v3m-9 3H3m13-6a3 3 0 10-6 0v3h6V9zM3 13h13" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
          </svg>
          <span className="text-[10px] font-bold">Requests</span>
        </button>

        <Link to="/profile" className="flex flex-col items-center p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <img src={displayAvatar} alt="Profile" className="w-6 h-6 rounded-full object-cover mb-0.5 border border-slate-300 dark:border-slate-600" />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>

      </div>

      {/* Search Modal Overlay */}
      {openSearch && (
        <UserSearch close={() => setOpenSearch(false)} />
      )}
    </div>
  );
}

export default ChatSidebar;