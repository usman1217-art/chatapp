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
      
      // Auto-focus the input after attaching an image
      setTimeout(() => {
        if (textInputRef.current) textInputRef.current.focus();
      }, 0);
      
      setIsCompressing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (textInputRef.current) textInputRef.current.focus();
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
    
    // Clear inputs and instantly grab the cursor back to keep mobile keyboards open
    setText("");
    clearImage();
    setReplyingTo(null);

    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 0);

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
    <div className="border-t border-white/10 glass-panel p-3 sm:p-4 flex flex-col gap-2 shrink-0">
      
      {/* Reply UI Overlay */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-slate-100 dark:bg-white/10 border-l-4 border-slate-400 dark:border-white/50 px-4 py-2.5 rounded-lg mb-1 animate-fade-in shadow-sm border-r border-t border-b border-slate-200 dark:border-white/10">
          <div className="truncate text-xs">
            <span className="text-slate-900 dark:text-white font-bold block mb-0.5">Replying to message</span>
            <span className="text-slate-500 dark:text-slate-300">{replyingTo.text || "📷 Image"}</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-xl font-bold ml-2 transition-colors">
            &times;
          </button>
        </div>
      )}

      {/* Tiny Image Preview Thumbnail */}
      {imagePreview && (
        <div className="relative self-start mb-1 ml-12 animate-slide-up">
          <img 
            src={imagePreview} 
            alt="Upload Preview" 
            className="h-20 w-auto rounded-lg object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm" 
          />
          <button 
            onClick={clearImage}
            className="absolute -top-2.5 -right-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full w-6 h-6 flex items-center justify-center hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md transition-all border-2 border-white dark:border-[#0a192f]"
            title="Remove image"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3">
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
          className="w-12 h-12 text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-all shrink-0 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm disabled:opacity-40 cursor-pointer"
          title="Attach Image"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Text Input */}
        <input
          ref={textInputRef}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="glass-input flex-1 min-w-0 px-4 sm:px-5 py-3 rounded-2xl sm:rounded-full font-medium"
          placeholder={isCompressing ? "Compressing image..." : "Type a message..."}
          disabled={isCompressing}
        />

        {/* --- HORIZONTAL PILL SEND BUTTON (WITH AIRPLANE ICON) --- */}
        <button
          onClick={submit}
          disabled={(!text.trim() && !image) || isCompressing}
          className="glass-button h-12 px-4 sm:px-6 md:h-14 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center gap-2 shrink-0 font-bold tracking-wide cursor-pointer"
          title="Send Message"
        >
          {/* Text is hidden on tiny phones, shows as a standard horizontal button on slightly larger screens */}
          <span className="hidden sm:inline">Send</span>
          
          {/* Horizontal Paper Airplane Icon */}
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default MessageInput;