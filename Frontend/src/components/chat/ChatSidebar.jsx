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
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  const { user } = useAuth();
  const { selectedChat } = useChat();
  const { theme, toggleTheme, colorScheme, setColorScheme } = useAppTheme();

  const displayAvatar = user?.avatar 
    ? user.avatar 
    : `https://ui-avatars.com/api/?name=${user?.name || "?"}`;

  return (
    <div 
      className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-80 relative overflow-hidden flex-col glass-panel h-[100dvh] md:h-[calc(100dvh-32px)] md:m-4 md:rounded-3xl text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-white/10 shrink-0 z-20 transition-all duration-300`}
    >
      
      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-200 dark:border-white/10 shrink-0 bg-white/5 dark:bg-black/20">
        <div className="flex items-center gap-3">
          {/* Dynamic Profile Icon Link (Hidden on mobile) */}
          <Link 
            to="/profile" 
            title="Go to Profile"
            className="hidden md:block relative group rounded-full overflow-hidden border-2 border-white/20 hover:border-white transition-all duration-200 shadow-[0_0_10px_rgba(255,255,255,0.3)] shrink-0 bg-white/10"
          >
            <img 
              src={displayAvatar} 
              alt={user?.name || "Profile"} 
              className="w-10 h-10 object-cover"
            />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 text-glow">
            Messages
          </h2>
        </div>

        {/* Action Controls Side Header Layout */}
        <div className="flex items-center gap-2 relative">
          
          {/* Theme Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="hidden md:flex glass-button rounded-full w-9 h-9 md:w-10 md:h-10 transition-colors shadow-sm cursor-pointer items-center justify-center text-base"
              title="Change Theme"
            >
              🎨
            </button>
            
            {showThemeMenu && (
              <div className="hidden md:flex absolute top-12 left-0 md:-left-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-[100] flex-col gap-1 min-w-[140px] animate-fade-in">
                <button onClick={() => { setColorScheme("monochrome"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'monochrome' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22A10 10 0 1012 2v20z" /></svg> Monochrome</button>
                <button onClick={() => { setColorScheme("neon"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'neon' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Midnight Neon</button>
                <button onClick={() => { setColorScheme("sunset"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'sunset' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Sunset Glow</button>
                <button onClick={() => { setColorScheme("ocean"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'ocean' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C12 2 6 9 6 13C6 16.3137 8.68629 19 12 19C15.3137 19 18 16.3137 18 13C18 9 12 2 12 2Z" /></svg> Ocean Breeze</button>
                <button onClick={() => { setColorScheme("odyssey"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'odyssey' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Space Odyssey</button>
                <button onClick={() => { setColorScheme("spiderman"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'spiderman' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> Spider-Man</button>
                <button onClick={() => { setColorScheme("ertugrul"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'ertugrul' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg> Ertugrul Ghazi</button>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
                <button onClick={() => { toggleTheme(); setShowThemeMenu(false); }} className="flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                   {theme === "dark" ? <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Light Mode</> : <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> Dark Mode</>}
                </button>
              </div>
            )}
          </div>

          {/* New Chat/Search Button */}
          <button
            onClick={() => setOpenSearch(true)}
            className="glass-button rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl pb-1 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] shrink-0 cursor-pointer"
            title="Find User by ID"
          >
            +
          </button>
        </div>
      </div>

      {/* Desktop Tabs Switcher Bar (Hidden on Mobile) */}
      <div className="hidden md:flex border-b border-slate-200 dark:border-white/10 p-2 gap-1 bg-black/5 dark:bg-black/20 shrink-0">
        {["chats", "friends", "requests"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? "bg-slate-900 text-white dark:bg-white/20 dark:text-white shadow-md border border-slate-800 dark:border-white/30"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200"
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
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/10 flex items-center justify-around z-20 pb-safe shadow-lg">
        
        <button onClick={() => setActiveTab("chats")} className={`flex flex-col items-center p-2 transition-colors cursor-pointer ${activeTab === "chats" ? "text-slate-900 dark:text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>
          <svg className="w-6 h-6 mb-0.5" fill={activeTab === "chats" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[10px] font-bold">Chats</span>
        </button>

        <button onClick={() => setActiveTab("friends")} className={`flex flex-col items-center p-2 transition-colors cursor-pointer ${activeTab === "friends" ? "text-slate-900 dark:text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>
          <svg className="w-6 h-6 mb-0.5" fill={activeTab === "friends" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-[10px] font-bold">Friends</span>
        </button>

        {/* Mobile View Central Theme Trigger */}
        <button 
          onClick={() => setShowThemeMenu(!showThemeMenu)} 
          className="flex flex-col items-center p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors relative"
        >
          <span className="text-xl mb-0.5 leading-none">🎨</span>
          <span className="text-[10px] font-bold">Theme</span>
          
          {showThemeMenu && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-[100] flex flex-col gap-1 min-w-[140px] animate-fade-in text-left">
                <button onClick={(e) => { e.stopPropagation(); setColorScheme("monochrome"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'monochrome' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22A10 10 0 1012 2v20z" /></svg> Monochrome</button>
                <button onClick={(e) => { e.stopPropagation(); setColorScheme("neon"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'neon' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Midnight Neon</button>
                <button onClick={(e) => { e.stopPropagation(); setColorScheme("sunset"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'sunset' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Sunset Glow</button>
                <button onClick={(e) => { e.stopPropagation(); setColorScheme("ocean"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'ocean' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C12 2 6 9 6 13C6 16.3137 8.68629 19 12 19C15.3137 19 18 16.3137 18 13C18 9 12 2 12 2Z" /></svg> Ocean Breeze</button>
                <button onClick={(e) => { e.stopPropagation(); setColorScheme("odyssey"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'odyssey' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Space Odyssey</button>
                <button onClick={(e) => { e.stopPropagation(); setColorScheme("spiderman"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'spiderman' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> Spider-Man</button>
                <button onClick={(e) => { e.stopPropagation(); setColorScheme("ertugrul"); setShowThemeMenu(false); }} className={`flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${colorScheme === 'ertugrul' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg> Ertugrul Ghazi</button>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
                <button onClick={(e) => { e.stopPropagation(); toggleTheme(); setShowThemeMenu(false); }} className="flex items-center gap-2 text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                   {theme === "dark" ? <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Light Mode</> : <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> Dark Mode</>}
                </button>
              </div>
            )}
        </button>

        <button onClick={() => setActiveTab("requests")} className={`flex flex-col items-center p-2 transition-colors cursor-pointer ${activeTab === "requests" ? "text-slate-900 dark:text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>
          <svg className="w-6 h-6 mb-0.5" fill={activeTab === "requests" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m-3-3v3m6-3v3m-9 3H3m13-6a3 3 0 10-6 0v3h6V9zM3 13h13" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
          </svg>
          <span className="text-[10px] font-bold">Requests</span>
        </button>

        <Link to="/profile" className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <img src={displayAvatar} alt="Profile" className="w-6 h-6 rounded-full object-cover mb-0.5 border border-white/20" />
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