const onlineUsers = new Map();
const socketUsers = new Map();

const socketHandler = (io) => {

  io.on("connection", (socket) => {

    console.log("Connected:", socket.id);

    // User joins
    socket.on("join", (userId) => {

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }

      onlineUsers.get(userId).add(socket.id);

      socketUsers.set(socket.id, userId);

      io.emit(
        "onlineUsers",
        [...onlineUsers.keys()]
      );

    });

    // Send Message
    socket.on("sendMessage", (data) => {

      const receiverSockets =
        onlineUsers.get(
          data.receiverId?.toString()
        );

      if (receiverSockets) {

        receiverSockets.forEach((socketId) => {

          io.to(socketId).emit(
            "receiveMessage",
            data.message
          );

        });

      }

    });

    // Typing
    socket.on("typing", ({ receiverId }) => {

      const receiverSockets =
        onlineUsers.get(receiverId);

      if (receiverSockets) {

        receiverSockets.forEach((socketId) => {

          io.to(socketId).emit("typing");

        });

      }

    });

    // Stop Typing
    socket.on("stopTyping", ({ receiverId }) => {

      const receiverSockets =
        onlineUsers.get(receiverId);

      if (receiverSockets) {

        receiverSockets.forEach((socketId) => {

          io.to(socketId).emit("stopTyping");

        });

      }

    });

    // Read Receipt
    socket.on("messageRead", (data) => {

      const receiverSockets =
        onlineUsers.get(data.receiverId);

      if (receiverSockets) {

        receiverSockets.forEach((socketId) => {

          io.to(socketId).emit(
            "messageRead",
            data.messageId
          );

        });

      }

    });

    // Delete For Everyone
    socket.on("deleteForEveryone", (data) => {

      const receiverSockets =
        onlineUsers.get(data.receiverId);

      if (receiverSockets) {

        receiverSockets.forEach((socketId) => {

          io.to(socketId).emit(
            "messageDeleted",
            data.messageId
          );

        });

      }

    });

    // Disconnect
    socket.on("disconnect", () => {

      const userId =
        socketUsers.get(socket.id);

      if (userId) {

        const sockets =
          onlineUsers.get(userId);

        if (sockets) {

          sockets.delete(socket.id);

          if (sockets.size === 0) {
            onlineUsers.delete(userId);
          }

        }

        socketUsers.delete(socket.id);

      }

      io.emit(
        "onlineUsers",
        [...onlineUsers.keys()]
      );

      console.log(
        "Disconnected:",
        socket.id
      );

    });

  });

};

module.exports = socketHandler;