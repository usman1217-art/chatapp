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
    socket.on("typing", ({ receiverId }) => {
      const receiverIdStr = receiverId?.toString();
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("typing");
        });
      }
    });

    // Stop Typing
    socket.on("stopTyping", ({ receiverId }) => {
      const receiverIdStr = receiverId?.toString();
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("stopTyping");
        });
      }
    });

    // Read Receipt
    socket.on("messageRead", (data) => {
      const receiverIdStr = data.receiverId?.toString();
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("messageRead", data.messageId);
        });
      }
    });

    // Delete For Everyone (Fixed to ensure string matching evaluation)
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