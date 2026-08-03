import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";

function Home() {
  return (
    <div className="h-screen flex bg-slate-50 dark:bg-[#0a192f] overflow-hidden transition-colors duration-300">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
}

export default Home;