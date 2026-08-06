const onlineUsers = new Map();
const socketUsers = new Map();
const activeGames = new Map(); // Memory store for game states

// Pure utility helper evaluating matrix indices for Tic-Tac-Toe winning combinations
function checkWin(board) {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  return winConditions.some(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
}

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

    // Read Receipts (`markAsRead` synced with MessageList.jsx)
    socket.on("markAsRead", ({ chatId, readerId }) => {
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

    // WebRTC Voice Call Signaling Events
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

    // --- MULTIPLAYER GAME EVENTS ---
    
    // 1. Initialize Game
    socket.on("initiate-game", ({ chatId, player1Id, player2Id }) => {
      const gameId = chatId?.toString();
      const p1 = player1Id?.toString();
      const p2 = player2Id?.toString();

      const newGame = {
        gameId,
        players: [p1, p2],
        board: Array(9).fill(null),
        turn: p1,
        status: "active",
        winner: null
      };

      activeGames.set(gameId, newGame);

      // Route the new game state to all devices owned by both players
      [p1, p2].forEach(userId => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("game-updated", newGame);
          });
        }
      });
    });

    // 2. Handle Moves
    socket.on("make-move", ({ gameId, playerId, cellIndex }) => {
      const game = activeGames.get(gameId?.toString());
      const playerStrId = playerId?.toString();

      if (!game || game.status !== "active" || game.turn !== playerStrId) return;
      if (game.board[cellIndex] !== null) return;

      const marker = game.players[0] === playerStrId ? "X" : "O";
      game.board[cellIndex] = marker;

      if (checkWin(game.board)) {
        game.status = "won";
        game.winner = playerStrId;
      } else if (game.board.every(cell => cell !== null)) {
        game.status = "draw";
      } else {
        game.turn = game.players.find(id => id !== playerStrId);
      }

      activeGames.set(game.gameId, game);

      game.players.forEach(userId => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("game-updated", game);
          });
        }
      });
    });

    // 3. Reset Game
    socket.on("reset-game", ({ gameId }) => {
      const game = activeGames.get(gameId?.toString());
      if (!game) return;

      game.board = Array(9).fill(null);
      game.status = "active";
      game.winner = null;
      game.turn = game.players[0];

      activeGames.set(game.gameId, game);

      game.players.forEach(userId => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("game-updated", game);
          });
        }
      });
    });

    // 4. Cancel & Destroy Game (Cleanly structured inside connection loop)
    socket.on("cancel-game", ({ gameId }) => {
      const stringGameId = gameId?.toString();
      const game = activeGames.get(stringGameId);
      
      if (!game) return;

      game.players.forEach(userId => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("game-cancelled", { gameId: stringGameId });
          });
        }
      });

      activeGames.delete(stringGameId);
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