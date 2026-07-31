import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";

function ChatWindow() {
  const { selectedChat } = useChat();

  // If no chat is selected, hide the entire window on mobile screens (< md)
  if (!selectedChat) {
    return (
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-[#0a192f] transition-colors duration-300 p-6 text-center">
        {/* Decorative Chat Icon Container */}
        <div className="w-24 h-24 mb-6 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-md">
          <svg 
            className="w-12 h-12 text-indigo-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-slate-200 tracking-tight">
          Select a chat to start messaging
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Choose a conversation from the sidebar or find a user by their ID.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full h-[100dvh] md:h-screen bg-[#0a192f] overflow-hidden">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}

export default ChatWindow;