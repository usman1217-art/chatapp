import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

function TicTacToe({ onClose }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { selectedChat } = useChat();
  
  const [gameState, setGameState] = useState(null);
  const gameId = selectedChat?._id;

  useEffect(() => {
    if (!socket || !gameId) return;

    // Join the game room configuration dynamically on component mount
    socket.emit("initiate-game", {
      chatId: gameId,
      player1Id: user._id,
      player2Id: selectedChat.participants.find(p => p._id !== user._id)._id,
    });

    socket.on("game-updated", (updatedGame) => {
      setGameState(updatedGame);
    });

    return () => {
      socket.off("game-updated");
    };
  }, [socket, gameId]);

  if (!gameState) return <div className="p-4 text-center">Loading game space...</div>;

  const myTurn = gameState.turn === user._id;
  const opponent = selectedChat.participants.find(p => p._id !== user._id);

  const handleCellClick = (index) => {
    if (!myTurn || gameState.status !== "active") return;
    socket.emit("make-move", { gameId, playerId: user._id, cellIndex: index });
  };

  return (
    <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl max-w-xs mx-auto text-center shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-black uppercase tracking-wider text-indigo-400">Tic-Tac-Toe</h4>
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-white transition">Exit</button>
      </div>

      {/* Turn Status Monitor UI */}
      <div className="text-xs font-bold mb-4 text-slate-300">
        {gameState.status === "active" && (myTurn ? "🟢 Your Turn!" : `⏳ Waiting for ${opponent.name}...`)}
        {gameState.status === "won" && (gameState.winner === user._id ? "🎉 You Won!" : "❌ You Lost!")}
        {gameState.status === "draw" && "🤝 It's a Draw!"}
      </div>

      {/* 3x3 Game Board Grid Layout */}
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mb-4">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!myTurn || cell !== null || gameState.status !== "active"}
            className={`w-14 h-14 rounded-xl text-xl font-black flex items-center justify-center transition-all duration-200 border border-slate-700/40
              ${cell === "X" ? "text-indigo-400 bg-indigo-500/10" : "text-emerald-400 bg-emerald-500/10"}
              ${!cell && myTurn && gameState.status === "active" ? "hover:bg-slate-700/40 cursor-pointer" : "cursor-default"}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Restart Button options */}
      {gameState.status !== "active" && (
        <button
          onClick={() => socket.emit("reset-game", { gameId })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
        >
          Play Again
        </button>
      )}
    </div>
  );
}

export default TicTacToe;