const onlineUsers = new Map();
const socketUsers = new Map();
const activeGames = new Map(); // Global real-time gaming state store

// --- GAME UTILITIES & WIN CONDITION CHECKERS ---

function checkTicTacToeWin(board) {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  return winConditions.some(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
}

function checkConnect4Win(board, lastMoveIndex) {
  const directions = [
    [1, 0],  // Horizontal
    [0, 1],  // Vertical
    [1, 1],  // Diagonal down-right
    [1, -1]  // Diagonal up-right
  ];
  const token = board[lastMoveIndex];
  const r = Math.floor(lastMoveIndex / 7);
  const c = lastMoveIndex % 7;

  for (let [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      let nr = r + dr * i;
      let nc = c + dc * i;
      if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr * 7 + nc] === token) count++;
      else break;
    }
    for (let i = 1; i < 4; i++) {
      let nr = r - dr * i;
      let nc = c - dc * i;
      if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr * 7 + nc] === token) count++;
      else break;
    }
    if (count >= 4) return true;
  }
  return false;
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

    // Typing Status Listeners
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

    // Legacy Read Receipt Action Handler
    socket.on("messageRead", (data) => {
      const receiverIdStr = data.receiverId?.toString();
      const receiverSockets = onlineUsers.get(receiverIdStr);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("messageRead", data.messageId);
        });
      }
    });

    // Synchronized Message Batch State Reader
    socket.on("markAsRead", ({ chatId, readerId }) => {
      for (const [userId, socketIds] of onlineUsers.entries()) {
        if (userId !== readerId?.toString()) {
          socketIds.forEach((socketId) => {
            io.to(socketId).emit("messagesRead", { chatId });
          });
        }
      }
    });

    // Delete Messages Ecosystem Action 
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

    // WebRTC Voice Routing Events
    socket.on("call-user", ({ userToCall, signalData, from, name, avatar }) => {
      const targetSockets = onlineUsers.get(userToCall?.toString());
      if (targetSockets) {
        targetSockets.forEach((socketId) => {
          io.to(socketId).emit("incoming-call", { signal: signalData, from, name, avatar });
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

   // ✅ FIXED: Clear target definition prevents infinite echo loops
   socket.on("hangup", ({ to }) => {
    const targetSockets = onlineUsers.get(to?.toString());
    if (targetSockets) {
      targetSockets.forEach((socketId) => {
        io.to(socketId).emit("hangup");
      });
    }
  });
      
      const currentUserId = socketUsers.get(socket.id);
      const myOtherSockets = onlineUsers.get(currentUserId);
      if (myOtherSockets) {
        myOtherSockets.forEach((socketId) => {
          if (socketId !== socket.id) {
            io.to(socketId).emit("hangup");
          }
        });
      }
    });

    // --- MULTIPLAYER ENGINE CORE PIPELINE (GAME-AGNOSTIC BUILD) ---
    
    // 1. Initialize Game State Spaces
    socket.on("initiate-game", ({ chatId, player1Id, player2Id, gameType = "tictactoe" }) => {
      const gameId = chatId?.toString();
      const p1 = player1Id?.toString();
      const p2 = player2Id?.toString();

      let defaultBoardState;
      let extraState = {};

      if (gameType === "connect4") {
        defaultBoardState = Array(42).fill(null); 
      } else if (gameType === "rps") {
        defaultBoardState = { [p1]: null, [p2]: null }; 
      } else if (gameType === "memory") {
        const symbols = ["🍎", "🍌", "🍇", "🍊", "🍒", "🥝", "🍉", "🍍", "🍎", "🍌", "🍇", "🍊", "🍒", "🥝", "🍉", "🍍"];
        defaultBoardState = symbols.sort(() => Math.random() - 0.5).map((s, idx) => ({ id: idx, symbol: s, isFlipped: false, isMatched: false }));
        extraState.selectedCards = [];
      } else if (gameType === "dots") {
        defaultBoardState = {
          hLines: Array(12).fill(null),
          vLines: Array(12).fill(null),
          boxes: Array(4).fill(null)
        };
      } else {
        defaultBoardState = Array(9).fill(null);
      }

      const newGame = {
        gameId,
        gameType,
        players: [p1, p2],
        board: defaultBoardState,
        turn: p1,
        status: "active",
        winner: null,
        ...extraState
      };

      activeGames.set(gameId, newGame);

      [p1, p2].forEach(userId => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("game-updated", newGame);
          });
        }
      });
    });

    // 2. Compute Moves for Dynamic Game Models
    socket.on("make-move", ({ gameId, playerId, cellIndex, choice, columnIndex, lineType, lineIdx }) => {
      const stringGameId = gameId?.toString();
      const game = activeGames.get(stringGameId);
      const playerStrId = playerId?.toString();

      if (!game || game.status !== "active") return;

      const p1 = game.players[0];
      const p2 = game.players[1];

      // --- SUB-ENGINE A: TIC-TAC-TOE ---
      if (game.gameType === "tictactoe") {
        if (game.turn !== playerStrId || game.board[cellIndex] !== null) return;
        game.board[cellIndex] = p1 === playerStrId ? "X" : "O";
        if (checkTicTacToeWin(game.board)) {
          game.status = "won";
          game.winner = playerStrId;
        } else if (game.board.every(cell => cell !== null)) {
          game.status = "draw";
        } else {
          game.turn = game.players.find(id => id !== playerStrId);
        }
      }

      // --- SUB-ENGINE B: ROCK PAPER SCISSORS ---
      else if (game.gameType === "rps") {
        game.board[playerStrId] = choice;
        if (game.board[p1] && game.board[p2]) {
          const m1 = game.board[p1];
          const m2 = game.board[p2];
          if (m1 === m2) {
            game.status = "draw";
          } else if (
            (m1 === "rock" && m2 === "scissors") ||
            (m1 === "paper" && m2 === "rock") ||
            (m1 === "scissors" && m2 === "paper")
          ) {
            game.status = "won";
            game.winner = p1;
          } else {
            game.status = "won";
            game.winner = p2;
          }
        } else {
          game.turn = game.players.find(id => id !== playerStrId);
        }
      }

      // --- SUB-ENGINE C: CONNECT FOUR ---
      else if (game.gameType === "connect4") {
        if (game.turn !== playerStrId) return;
        const col = parseInt(columnIndex, 10);
        if (isNaN(col) || col < 0 || col > 6) return;

        let targetDropIdx = -1;
        for (let row = 5; row >= 0; row--) {
          const currentCellCheck = row * 7 + col;
          if (game.board[currentCellCheck] === null) {
            targetDropIdx = currentCellCheck;
            break;
          }
        }
        if (targetDropIdx === -1) return;

        game.board[targetDropIdx] = p1 === playerStrId ? "R" : "Y";

        if (checkConnect4Win(game.board, targetDropIdx)) {
          game.status = "won";
          game.winner = playerStrId;
        } else if (game.board.every(cell => cell !== null)) {
          game.status = "draw";
        } else {
          game.turn = game.players.find(id => id !== playerStrId);
        }
      }

      // --- SUB-ENGINE D: MEMORY MATCH ---
      else if (game.gameType === "memory") {
        if (game.turn !== playerStrId) return;
        
        // Handle delayed reset signal from frontend
        if (cellIndex === -1) {
          if (game.selectedCards.length === 2) {
            const [idx1, idx2] = game.selectedCards;
            game.board[idx1].isFlipped = false;
            game.board[idx2].isFlipped = false;
            game.selectedCards = [];
            game.turn = game.players.find(id => id !== playerStrId);
          }
        } else {
          const cardIdx = cellIndex;
          if (game.board[cardIdx].isFlipped || game.board[cardIdx].isMatched || game.selectedCards.length >= 2) return;

          game.board[cardIdx].isFlipped = true;
          game.selectedCards.push(cardIdx);

          if (game.selectedCards.length === 2) {
            const [idx1, idx2] = game.selectedCards;
            if (game.board[idx1].symbol === game.board[idx2].symbol) {
              game.board[idx1].isMatched = true;
              game.board[idx2].isMatched = true;
              game.selectedCards = [];
              if (game.board.every(card => card.isMatched)) {
                game.status = "won";
                game.winner = playerStrId;
              }
            }
          }
        }
      }

      // --- SUB-ENGINE E: DOTS AND BOXES ---
      else if (game.gameType === "dots") {
        if (game.turn !== playerStrId) return;
        
        if (lineType === 'h' && game.board.hLines[lineIdx] !== null) return;
        if (lineType === 'v' && game.board.vLines[lineIdx] !== null) return;

        if (lineType === 'h') game.board.hLines[lineIdx] = playerStrId;
        else game.board.vLines[lineIdx] = playerStrId;

        let boxCompleted = false;
        const boxCheckDefinitions = [
          { id: 0, top: 0, bottom: 2, left: 0, right: 1 },
          { id: 1, top: 1, bottom: 3, left: 1, right: 2 },
          { id: 2, top: 2, bottom: 4, left: 3, right: 4 },
          { id: 3, top: 3, bottom: 5, left: 4, right: 5 }
        ];

        boxCheckDefinitions.forEach(b => {
          if (game.board.boxes[b.id] === null) {
            if (game.board.hLines[b.top] && game.board.hLines[b.bottom] && game.board.vLines[b.left] && game.board.vLines[b.right]) {
              game.board.boxes[b.id] = playerStrId;
              boxCompleted = true;
            }
          }
        });

        if (game.board.boxes.every(b => b !== null)) {
          game.status = "won";
          const p1Count = game.board.boxes.filter(b => b === p1).length;
          const p2Count = game.board.boxes.filter(b => b === p2).length;
          if (p1Count === p2Count) game.status = "draw";
          else game.winner = p1Count > p2Count ? p1 : p2;
        } else if (!boxCompleted) {
          game.turn = game.players.find(id => id !== playerStrId);
        }
      }

      activeGames.set(stringGameId, game);

      game.players.forEach(userId => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("game-updated", game);
          });
        }
      });
    });

    // 3. Reset and Reinitialize Session States
    socket.on("reset-game", ({ gameId }) => {
      const stringGameId = gameId?.toString();
      const game = activeGames.get(stringGameId);
      if (!game) return;

      const p1 = game.players[0];
      const p2 = game.players[1];

      if (game.gameType === "connect4") {
        game.board = Array(42).fill(null);
      } else if (game.gameType === "rps") {
        game.board = { [p1]: null, [p2]: null };
      } else if (game.gameType === "memory") {
        const symbols = ["🍎", "🍌", "🍇", "🍊", "🍒", "🥝", "🍉", "🍍", "🍎", "🍌", "🍇", "🍊", "🍒", "🥝", "🍉", "🍍"];
        game.board = symbols.sort(() => Math.random() - 0.5).map((s, idx) => ({ id: idx, symbol: s, isFlipped: false, isMatched: false }));
        game.selectedCards = [];
      } else if (game.gameType === "dots") {
        game.board = { hLines: Array(12).fill(null), vLines: Array(12).fill(null), boxes: Array(4).fill(null) };
      } else {
        game.board = Array(9).fill(null);
      }

      game.status = "active";
      game.winner = null;
      game.turn = p1;

      activeGames.set(stringGameId, game);

      game.players.forEach(userId => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("game-updated", game);
          });
        }
      });
    });

    // 4. Cancel & Destroy Game Instance Remotely
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

    // Session Termination Disconnect Routine
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