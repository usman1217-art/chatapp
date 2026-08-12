import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

function ConnectFour({ activeGame, setActiveGame, socket }) {
  const { user } = useAuth();
  const { selectedChat } = useChat();

  const currentUserId = user?._id || user;
  const gameId = activeGame.gameId;
  const opponent = selectedChat?.participants?.find((p) => (p._id || p) !== currentUserId);

  const myTurn = activeGame.turn === currentUserId;
  const isP1 = activeGame.players[0] === currentUserId;

  const handleColumnClick = (colIndex) => {
    if (!myTurn || activeGame.status !== "active") return;
    
    // Check if the top cell of the column is already full
    if (activeGame.board[colIndex] !== null) return;

    socket.emit("make-move", { 
      gameId, 
      playerId: currentUserId, 
      columnIndex: colIndex 
    });
  };

  const handleCancelGame = () => {
    setActiveGame(null);
    socket.emit("cancel-game", { gameId }); 
  };

  return (
    <div className="bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xl max-w-[320px] w-full text-center transition-all duration-500 animate-[fade-in_0.3s_ease-out]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 flex items-center gap-2">
          <span className="animate-pulse">🔴</span> Connect Four
        </h4>
        <button 
          onClick={handleCancelGame} 
          className="text-[11px] font-bold text-slate-500 hover:text-white bg-slate-100 hover:bg-red-500 dark:bg-slate-800 dark:hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-90 shadow-sm"
        >
          Quit
        </button>
      </div>

      {/* Status Banner */}
      <div className={`text-xs font-bold mb-4 px-3 py-2.5 rounded-xl border transition-all duration-500 ${
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
            ? <span className="flex items-center justify-center gap-1.5">🟢 Your Turn ({isP1 ? "Indigo" : "Emerald"})</span> 
            : <span className="flex items-center justify-center gap-1.5 opacity-70">⏳ Waiting for {opponent?.name?.split(' ')[0] || "Player"}...</span>
        )}
        {activeGame.status === "won" && (
          activeGame.winner === currentUserId ? "🏆 Column Cleared! You Won!" : "❌ Defeat! Opponent Connected 4!"
        )}
        {activeGame.status === "draw" && "🤝 Grid full! It's a Draw!"}
      </div>

      {/* Connect Four 6x7 Grid Board Canvas */}
      <div className="bg-slate-100 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner inline-block max-w-full mx-auto">
        
        {/* Interactive Column Guide Headers (Top row drop arrows) */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 px-0.5">
          {Array(7).fill(null).map((_, colIdx) => (
            <button
              key={colIdx}
              onClick={() => handleColumnClick(colIdx)}
              disabled={!myTurn || activeGame.status !== "active" || activeGame.board[colIdx] !== null}
              className={`text-sm font-bold h-6 flex items-center justify-center rounded-md transition-all duration-150 select-none cursor-pointer
                ${myTurn && activeGame.status === "active" && activeGame.board[colIdx] === null
                  ? isP1 
                    ? "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 animate-bounce" 
                    : "hover:bg-emerald-500/20 text-emerald-400 animate-bounce"
                  : "opacity-0 cursor-default"
                }`}
            >
              👇
            </button>
          ))}
        </div>

        {/* 6 Rows x 7 Columns Grid Matrix layout */}
        <div className="grid grid-cols-7 gap-1.5 bg-slate-200 dark:bg-slate-800/90 p-2.5 rounded-xl shadow-lg border border-slate-300 dark:border-slate-700">
          {activeGame.board.map((cell, index) => (
            <div 
              key={index} 
              className="w-[30px] h-[30px] rounded-full bg-white dark:bg-black shadow-inner relative flex items-center justify-center border border-slate-300 dark:border-slate-700"
            >
              {cell && (
                <div className={`w-full h-full rounded-full transition-all duration-500 absolute scale-95 shadow-md flex items-center justify-center animate-[bounce_0.4s_ease-out_1]
                  ${cell === "R" 
                    ? "bg-slate-800 dark:bg-slate-100 border border-slate-700 dark:border-slate-200" 
                    : "bg-gradient-to-tr from-emerald-700 to-emerald-400 border border-emerald-300/40"
                  }`} 
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Play Again Panel Trigger Controls */}
      <div className={`transition-all duration-500 overflow-hidden ${activeGame.status !== "active" ? "max-h-[120px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => socket.emit("reset-game", { gameId })}
            className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs py-3 rounded-xl transition shadow-md active:scale-95 cursor-pointer"
          >
            🔄 Play Again
          </button>
        </div>
      </div>

    </div>
  );
}

export default ConnectFour;