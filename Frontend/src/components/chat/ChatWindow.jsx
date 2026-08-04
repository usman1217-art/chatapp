import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useEffect } from "react";

function ChatWindow() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const {
    selectedChat,
    setSelectedChat,
    viewingProfile,
    setViewingProfile,
    activeLightboxImage,
    setActiveLightboxImage,
    setMessages,
  } = useChat();

  useEffect(() => {
    const handlePopState = () => {
      if (selectedChat) {
        setSelectedChat(null);
      }
    };
  
    window.addEventListener("popstate", handlePopState);
  
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedChat, setSelectedChat]);

  if (!selectedChat) {
    return (
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-slate-50 dark:bg-[#0a192f] transition-colors duration-300 p-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center shadow-md">
          <svg className="w-12 h-12 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Select a chat to start messaging</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Choose a conversation from the sidebar or find a user by their ID.</p>
      </div>
    );
  }

  const otherUser = selectedChat.participants?.find(
    (participant) => (participant._id || participant) !== (user?._id || user)
  );

  const handleDownloadImage = async (e, imageUrl) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const localBlobUrl = window.URL.createObjectURL(blob);
      
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = localBlobUrl;
      downloadAnchor.download = `chat-media-${Date.now()}.jpg`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      
      document.body.removeChild(downloadAnchor);
      window.URL.revokeObjectURL(localBlobUrl);
    } catch (error) {
      console.error("Image downloader file acquisition exception:", error);
    }
  };

  return (
    <div className="flex flex-1 w-full h-[100dvh] md:h-screen bg-slate-50 dark:bg-[#0a192f] overflow-hidden relative transition-colors duration-300">
      
      {/* Primary Communication Channel Content Tree */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        
        {/* --- LOCKED MOBILE HEADER LAYER --- */}
        {/* Pinned with complete hard absolute tracking on mobile layout screens to neutralize keyboard viewport resizes */}
        <div
          onClick={() => setViewingProfile(!viewingProfile)}
          className="cursor-pointer max-md:absolute max-md:top-0 max-md:left-0 max-md:right-0 sticky top-0 z-30 shrink-0"
        >
          <ChatHeader />
        </div>

        {/* --- MESSAGE SCROLL VIEW CONTAINER --- */}
        {/* Added a relative container shell with a padding offset layer matching the mobile header metrics exactly */}
        <div className="flex-1 flex flex-col min-h-0 max-md:pt-[65px] relative">
          <MessageList socket={socket} setMessages={setMessages} />
        </div>

        <MessageInput />
      </div>

      {/* Profile Sidebar Drawer */}
      {viewingProfile && (
        <div className="absolute md:relative right-0 top-0 h-full w-80 bg-white dark:bg-[#0d1e36] border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col p-6 shadow-2xl animate-slide-in text-slate-800 dark:text-slate-100 shrink-0 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">User Details</h3>
            <button onClick={() => setViewingProfile(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-xl font-bold cursor-pointer">&times;</button>
          </div>

          <div className="flex flex-col items-center text-center gap-4">
            <img 
              src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || "U")}&background=4f46e5&color=fff`} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-700 shadow-md bg-slate-200 dark:bg-slate-800"
            />
            <div className="w-full min-w-0">
              <h4 className="text-xl font-bold truncate">{otherUser?.name || "Chat User"}</h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 select-all truncate tracking-wide bg-indigo-50 dark:bg-indigo-950/40 py-1 px-2 rounded-md border border-indigo-100 dark:border-indigo-900/40">{otherUser?.userId || "ID Hidden"}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm border-t border-slate-200 dark:border-slate-800/80 pt-6 overflow-y-auto flex-1">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-xs block uppercase tracking-wider font-bold">Email Address</span>
              <span className="text-slate-800 dark:text-slate-200 select-all font-medium break-all">{otherUser?.email || "No email listed"}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-xs block uppercase tracking-wider font-bold">About Status</span>
              <p className="text-slate-700 dark:text-slate-300 italic mt-1.5 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm shadow-sm">
                "{otherUser?.about || "Hey there! I am using Chat App."}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Overlay */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in cursor-zoom-out"
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 z-[110]">
            <button 
              onClick={(e) => handleDownloadImage(e, activeLightboxImage)}
              className="p-2.5 bg-slate-800/90 hover:bg-indigo-600 text-white rounded-full transition-all border border-slate-700 shadow-lg cursor-pointer transform active:scale-95"
              title="Download File Assets"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            
            <button 
              onClick={() => setActiveLightboxImage(null)}
              className="p-2.5 bg-slate-800/90 hover:bg-red-500 text-white rounded-full transition-all border border-slate-700 shadow-lg cursor-pointer"
              title="Close Panel Layout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <img 
            src={activeLightboxImage} 
            alt="Expanded context window viewport mapping" 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain animate-scale-up cursor-default select-none border border-slate-800"
          />
        </div>
      )}
    </div>
  );
}

export default ChatWindow;