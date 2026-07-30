import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";

function MessageList() {
  const { messages } = useChat();
  const bottomRef = useRef(null);

  // Auto-scroll to the bottom when a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-2 bg-[#0a192f] scroll-smooth">
      {messages.map((msg, index) => (
        <MessageBubble 
          key={msg._id || index} 
          message={msg} 
        />
      ))}
      
      {/* Invisible div to act as the scroll anchor */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}

export default MessageList;