import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";

function Home() {
  return (
    <div className="h-screen flex w-full max-w-[1920px] mx-auto overflow-hidden text-slate-100">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
}

export default Home;