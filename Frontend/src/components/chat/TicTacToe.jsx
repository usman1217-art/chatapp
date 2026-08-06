import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

function TicTacToe({ activeGame, setActiveGame, socket }) {
  const { user } = useAuth();
  const { selectedChat } = useChat();

  const currentUserId = user?._id || user;
  const gameId = activeGame.gameId;

  const myTurn = activeGame.turn === currentUserId;
  const opponent = selectedChat?.participants?.find(
    (p) => (p._id || p) !== currentUserId
  );

  const handleCellClick = (index) => {
    if (!myTurn || activeGame.board[index] !== null || activeGame.status !== "active") return;
    
    socket.emit("make-move", { 
      gameId, 
      playerId: currentUserId, 
      cellIndex: index 
    });
  };

  // ✅ NEW: Handles clearing the game fully from both UI and backend state
  const handleCancelGame = () => {
    setActiveGame(null);
    // Optional: Notify backend to clean up RAM mapping if needed
    socket.emit("reset-game", { gameId }); 
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl max-w-[280px] w-full text-center animate-scale-up">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          🎮 Tic-Tac-Toe
        </h4>
        <button 
          onClick={handleCancelGame} 
          className="text-xs font-bold text-slate-400 hover:text-red-500 transition cursor-pointer"
          title="Close match space"
        >
          Cancel
        </button>
      </div>

      {/* Dynamic Status Banner — Explicitly tracking results */}
      <div className={`text-xs font-bold mb-4 px-3 py-2 rounded-xl border transition-all ${
        activeGame.status === "won" 
          ? activeGame.winner === currentUserId 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 animate-pulse" 
            : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          : activeGame.status === "draw"
          ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          : "bg-slate-100/80 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/40 text-slate-700 dark:text-slate-300"
      }`}>
        {activeGame.status === "active" && (
          myTurn ? "🟢 Your Turn!" : `⏳ Waiting for ${opponent?.name || "Player"}...`
        )}
        {activeGame.status === "won" && (
          activeGame.winner === currentUserId ? "🏆 Victory! You Won!" : "❌ Defeat! Opponent Won!"
        )}
        {activeGame.status === "draw" && "🤝 Match Drawn! Good game!"}
      </div>

      {/* 3x3 Grid Matrix */}
      <div className="grid grid-cols-3 gap-2 mx-auto max-w-[180px] mb-4">
        {activeGame.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!myTurn || cell !== null || activeGame.status !== "active"}
            className={`w-14 h-14 rounded-xl text-xl font-black flex items-center justify-center transition-all duration-150 border select-none
              ${cell === "X" ? "text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400" : ""}
              ${cell === "O" ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400" : ""}
              ${!cell && myTurn && activeGame.status === "active" ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-indigo-500/5 hover:border-indigo-500/40 cursor-pointer active:scale-95" : "border-slate-200/40 dark:border-slate-800/40 cursor-default"}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* ✅ Action Control Interface Panel */}
      {activeGame.status !== "active" && (
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => socket.emit("reset-game", { gameId })}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md active:scale-98 cursor-pointer"
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleCancelGame}
            className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition active:scale-98 cursor-pointer"
          >
            Exit Board
          </button>
        </div>
      )}
    </div>
  );
}

export default TicTacToe;