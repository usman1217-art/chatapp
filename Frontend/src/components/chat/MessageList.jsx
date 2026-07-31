import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";
import MessageBubble from "./MessageBubble";

function MessageList() {
  const { messages, setMessages } = useChat();
  const { socket } = useSocket();
  const bottomRef = useRef(null);

  // Auto-scroll to the bottom when a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for deletions from the other user
  useEffect(() => {
    if (!socket) return;

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, text: "This message was deleted", image: null, deletedForEveryone: true }
            : m
        )
      );
    });

    return () => {
      socket.off("messageDeleted");
    };
  }, [socket, setMessages]);

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