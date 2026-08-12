import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

function RockPaperScissors({ activeGame, setActiveGame, socket }) {
  const { user } = useAuth();
  const { selectedChat } = useChat();

  const currentUserId = user?._id || user;
  const gameId = activeGame.gameId;
  const opponent = selectedChat?.participants?.find((p) => (p._id || p) !== currentUserId);

  // Read our choice and opponent's choice from the object dictionary
  const myChoice = activeGame.board[currentUserId];
  const opponentChoice = activeGame.board[opponent?._id || opponent];

  const handleChoice = (choice) => {
    if (myChoice || activeGame.status !== "active") return; // Already picked!
    
    socket.emit("make-move", { 
      gameId, 
      playerId: currentUserId, 
      choice 
    });
  };

  const handleCancelGame = () => {
    setActiveGame(null);
    socket.emit("cancel-game", { gameId }); 
  };

  const emojiMap = { rock: "✊", paper: "✋", scissors: "✌️" };

  return (
    <div className="bg-white/90 dark:bg-black/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 p-6 rounded-3xl shadow-2xl max-w-[280px] w-full text-center transition-all duration-500 animate-[fade-in_0.3s_ease-out]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 dark:text-amber-400 flex items-center gap-2">
          <span className="animate-pulse">✊</span> RPS
        </h4>
        <button 
          onClick={handleCancelGame} 
          className="text-[11px] font-bold text-slate-500 hover:text-white bg-slate-100 hover:bg-red-500 dark:bg-slate-800 dark:hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-90"
        >
          Quit
        </button>
      </div>

      {/* Status Banner */}
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
          !myChoice 
            ? <span>Make your move! 👇</span> 
            : <span className="opacity-70 animate-pulse">Waiting for {opponent?.name?.split(' ')[0] || "Opponent"}...</span>
        )}
        {activeGame.status === "won" && (
          activeGame.winner === currentUserId ? "🏆 Victory!" : "❌ Defeat!"
        )}
        {activeGame.status === "draw" && "🤝 Match Drawn!"}
      </div>

      {/* The Arena / Choices */}
      {activeGame.status === "active" && !myChoice ? (
        <div className="flex justify-center gap-3 mb-4">
          {["rock", "paper", "scissors"].map((choice) => (
            <button
              key={choice}
              onClick={() => handleChoice(choice)}
              className="w-[60px] h-[60px] rounded-2xl text-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all active:scale-75 hover:scale-105 cursor-pointer shadow-sm"
            >
              {emojiMap[choice]}
            </button>
          ))}
        </div>
      ) : (
        // Results Arena (Double Blind Reveal)
        <div className="flex justify-between items-center px-4 mb-4 mt-2">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold mb-1">You</span>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border bg-slate-50 dark:bg-slate-800 shadow-inner ${activeGame.status !== "active" && activeGame.winner === currentUserId ? "border-emerald-500 bg-emerald-500/10" : "border-slate-200 dark:border-slate-700"}`}>
              {myChoice ? emojiMap[myChoice] : "❓"}
            </div>
          </div>
          
          <div className="text-sm font-black text-slate-300 dark:text-slate-600 italic">VS</div>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold mb-1">{opponent?.name?.split(' ')[0] || "Them"}</span>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border bg-slate-50 dark:bg-slate-800 shadow-inner ${activeGame.status !== "active" && activeGame.winner === (opponent?._id || opponent) ? "border-emerald-500 bg-emerald-500/10" : "border-slate-200 dark:border-slate-700"}`}>
              {/* Hide opponent choice until game is finished! */}
              {activeGame.status === "active" ? (opponentChoice ? "🔒" : "❓") : emojiMap[opponentChoice]}
            </div>
          </div>
        </div>
      )}

      {/* Post Game Actions */}
      <div className={`transition-all duration-500 overflow-hidden ${activeGame.status !== "active" ? "max-h-[120px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => socket.emit("reset-game", { gameId })}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] active:scale-95 cursor-pointer"
          >
            🔄 Play Again
          </button>
        </div>
      </div>

    </div>
  );
}

export default RockPaperScissors;