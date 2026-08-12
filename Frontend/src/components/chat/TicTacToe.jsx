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

  // ✅ FIXED: Now properly emits "cancel-game" to destroy the session on both screens instantly
  const handleCancelGame = () => {
    setActiveGame(null);
    socket.emit("cancel-game", { gameId }); 
  };

  return (
    <div className="bg-white/90 dark:bg-[#050505]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl max-w-[280px] w-full text-center transition-all duration-500 ease-out transform scale-100 animate-[fade-in_0.3s_ease-out]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <span className="animate-pulse">🎮</span> Tic-Tac-Toe
        </h4>
        <button 
          onClick={handleCancelGame} 
          className="text-[11px] font-bold text-slate-500 hover:text-white bg-slate-100 hover:bg-red-500 dark:bg-slate-800 dark:hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-90 shadow-sm"
          title="End match instantly"
        >
          Quit
        </button>
      </div>

      {/* Dynamic Status Banner */}
      <div className={`text-xs font-bold mb-5 px-3 py-2.5 rounded-xl border transition-all duration-500 ${
        activeGame.status === "won" 
          ? activeGame.winner === currentUserId 
            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse" 
            : "bg-red-500/15 border-red-500/50 text-red-600 dark:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          : activeGame.status === "draw"
          ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400"
          : "bg-slate-100/80 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/40 text-slate-700 dark:text-slate-300"
      }`}>
        {activeGame.status === "active" && (
          myTurn 
            ? <span className="flex items-center justify-center gap-1.5">🟢 Your Turn!</span> 
            : <span className="flex items-center justify-center gap-1.5 opacity-70">⏳ Waiting for {opponent?.name?.split(' ')[0] || "Player"}...</span>
        )}
        {activeGame.status === "won" && (
          activeGame.winner === currentUserId 
            ? <span className="text-sm">🏆 Victory!</span> 
            : <span className="text-sm">❌ Defeat!</span>
        )}
        {activeGame.status === "draw" && "🤝 Match Drawn!"}
      </div>

      {/* 3x3 Grid Matrix */}
      <div className="grid grid-cols-3 gap-2 mx-auto max-w-[190px] mb-4">
        {activeGame.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!myTurn || cell !== null || activeGame.status !== "active"}
            className={`w-[60px] h-[60px] rounded-2xl text-2xl font-black flex items-center justify-center transition-all duration-200 border select-none overflow-hidden
              ${cell === "X" ? "text-slate-900 bg-slate-900/10 border-slate-900/30 dark:text-white dark:bg-white/10 dark:border-white/30 drop-shadow-md" : ""}
              ${cell === "O" ? "text-rose-500 bg-rose-500/10 border-rose-500/30 drop-shadow-md" : ""}
              ${!cell && myTurn && activeGame.status === "active" ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-900/10 hover:border-slate-900/50 dark:hover:bg-white/10 dark:hover:border-white/50 cursor-pointer active:scale-75 hover:scale-105" : "border-slate-200/40 dark:border-slate-800/40 cursor-default"}
            `}
          >
            {/* Pop-in animation for X and O */}
            <span className={`transition-transform duration-300 ${cell ? 'scale-100 opacity-100 animate-[bounce_0.3s_ease-out_1]' : 'scale-0 opacity-0'}`}>
              {cell}
            </span>
          </button>
        ))}
      </div>

      {/* Action Control Interface Panel (Smooth fade in when game ends) */}
      <div className={`transition-all duration-500 overflow-hidden ${activeGame.status !== "active" ? "max-h-[120px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => socket.emit("reset-game", { gameId })}
            className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs py-3 rounded-xl transition-all duration-200 shadow-sm active:scale-95 hover:-translate-y-0.5 cursor-pointer"
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleCancelGame}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl transition-all duration-200 active:scale-95 hover:-translate-y-0.5 cursor-pointer"
          >
            Exit Board
          </button>
        </div>
      </div>

    </div>
  );
}

export default TicTacToe;