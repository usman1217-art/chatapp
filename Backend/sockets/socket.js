const onlineUsers = new Map();
const socketUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // User joins
    socket.on("join", (userId) => {
      const stringUserId = userId?.toString();
      if (!stringUserId) return;

      if (!onlineUsers.has(stringUserId)) {
        onlineUsers.set(stringUserId, new Set());
      }
      onlineUsers.get(stringUserId).add(socket.id);
      socketUsers.set(socket.id, stringUserId);

      io.emit("onlineUsers", [...onlineUsers.keys()]);
    });

    // Send Message
    socket.on("sendMessage", (data) => {
      const receiverIdStr = data.receiverId?.toString();
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("receiveMessage", data.message);
        });
      }
    });

    // Typing
    socket.on("typing", ({ receiverId, chatId }) => {
      const receiverIdStr = receiverId?.toString();
      const senderId = socketUsers.get(socket.id);
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("typing", { senderId, chatId });
        });
      }
    });

    // Stop Typing
    socket.on("stopTyping", ({ receiverId, chatId }) => {
      const receiverIdStr = receiverId?.toString();
      const senderId = socketUsers.get(socket.id);
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("stopTyping", { senderId, chatId });
        });
      }
    });

    // Read Receipt (Legacy)
    socket.on("messageRead", (data) => {
      const receiverIdStr = data.receiverId?.toString();
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("messageRead", data.messageId);
        });
      }
    });

    // --- NEW: Read Receipts (`markAsRead` synced with MessageList.jsx) ---
    socket.on("markAsRead", ({ chatId, readerId }) => {
      // Notify other online users that messages in this chat have been read
      for (const [userId, socketIds] of onlineUsers.entries()) {
        if (userId !== readerId?.toString()) {
          socketIds.forEach((socketId) => {
            io.to(socketId).emit("messagesRead", { chatId });
          });
        }
      }
    });

    // Delete For Everyone
    socket.on("deleteMessage", (data) => {
      const receiverIdStr = data.receiverId?.toString();
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("messageDeleted", { 
            messageId: data.messageId 
          });
        });
      }
    });

    // --- NEW: WebRTC Voice Call Signaling Events ---
    socket.on("call-user", ({ userToCall, signalData, from, name }) => {
      const targetSockets = onlineUsers.get(userToCall?.toString());
      if (targetSockets) {
        targetSockets.forEach((socketId) => {
          io.to(socketId).emit("incoming-call", { signal: signalData, from, name });
        });
      }
    });

    socket.on("answer-call", (data) => {
      const targetSockets = onlineUsers.get(data.to?.toString());
      if (targetSockets) {
        targetSockets.forEach((socketId) => {
          io.to(socketId).emit("call-accepted", data.signal);
        });
      }
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      const targetSockets = onlineUsers.get(to?.toString());
      if (targetSockets) {
        targetSockets.forEach((socketId) => {
          io.to(socketId).emit("ice-candidate", candidate);
        });
      }
    });

    socket.on("hangup", ({ to }) => {
      const targetSockets = onlineUsers.get(to?.toString());
      if (targetSockets) {
        targetSockets.forEach((socketId) => {
          io.to(socketId).emit("hangup");
        });
      }
    });
    // ---------------------------------------------

    // Disconnect
    socket.on("disconnect", () => {
      const userId = socketUsers.get(socket.id);
      
      if (userId) {
        const sockets = onlineUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
          }
        }
        socketUsers.delete(socket.id);
      }

      io.emit("onlineUsers", [...onlineUsers.keys()]);
      console.log("Disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;