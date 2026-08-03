import { useRef, useState, useEffect } from "react";
import { sendMessage } from "../../services/chatApi";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

function MessageInput() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  const { socket } = useSocket();
  const { user } = useAuth();
  const { selectedChat, setMessages, replyingTo, setReplyingTo } = useChat();

  const receiver = selectedChat?.participants.find(
    (p) => p._id !== user._id
  );

  // Auto-focus text input when a user initiates a reply
  useEffect(() => {
    if (replyingTo && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [replyingTo]);

  const handleTyping = (value) => {
    setText(value);

    if (!socket || !receiver) return;

    socket.emit("typing", { receiverId: receiver._id, chatId: selectedChat?._id });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: receiver._id, chatId: selectedChat?._id });
    }, 1000);
  };

  // Canvas Image Compression logic
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          ctx.canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, "image/jpeg", 0.7);
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressing(true);
      const optimizedImg = await compressImage(file);
      setImage(optimizedImg);
      setImagePreview(URL.createObjectURL(optimizedImg));
      setIsCompressing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!text.trim() && !image) return;

    const currentText = text;
    const currentReply = replyingTo;
    
    // 1. Optimistic UI: Render instantly to screen
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      chat: selectedChat._id,
      sender: user,
      text: currentText,
      image: imagePreview,
      replyTo: currentReply,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setText("");
    clearImage();
    setReplyingTo(null);

    // 2. Prepare database payload
    const formData = new FormData();
    formData.append("chatId", selectedChat._id);
    formData.append("text", currentText);
    
    if (image) {
      formData.append("image", image);
    }
    if (currentReply) {
      formData.append("replyToId", currentReply._id);
    }

    try {
      const res = await sendMessage(formData);

      // 3. Replace the placeholder message with the real one from the server
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMessage._id ? res.data.message : m))
      );

      if (socket) {
        socket.emit("sendMessage", {
          receiverId: res.data.receiverId,
          message: res.data.message,
        });
      }
    } catch (err) {
      console.log(err);
      // Remove optimistic message if network request completely fails
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
    }
  };

  return (
    <div className="border-t border-slate-800 bg-[#0a192f] p-4 flex flex-col gap-2 transition-colors duration-300 shrink-0">
      
      {/* Reply UI Overlay */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-slate-800/60 border-l-4 border-indigo-500 px-4 py-2 rounded-md mb-1 animate-fade-in">
          <div className="truncate text-xs">
            <span className="text-indigo-400 font-bold block">Replying to message</span>
            <span className="text-slate-300">{replyingTo.text || "📷 Image"}</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white text-lg font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Tiny Image Preview Thumbnail */}
      {imagePreview && (
        <div className="relative self-start mb-1 ml-12">
          <img 
            src={imagePreview} 
            alt="Upload Preview" 
            className="h-20 w-auto rounded-lg object-cover border border-slate-700 shadow-sm" 
          />
          <button 
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md transition-colors"
            title="Remove image"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />

        {/* Custom Image Upload Icon Button */}
        <button
          disabled={isCompressing}
          onClick={() => fileInputRef.current.click()}
          className="p-2.5 text-slate-400 hover:text-indigo-400 bg-slate-800 hover:bg-slate-700 rounded-full transition-all shrink-0 border border-slate-700/60 disabled:opacity-40"
          title="Attach Image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Text Input */}
        <input
          ref={textInputRef}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="flex-1 bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 shadow-inner"
          placeholder={isCompressing ? "Compressing image..." : "Type a message..."}
          disabled={isCompressing}
        />

        {/* Send Button Icon */}
        <button
          onClick={submit}
          disabled={(!text.trim() && !image) || isCompressing}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-sm flex items-center justify-center shrink-0"
          title="Send Message"
        >
          <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default MessageInput;