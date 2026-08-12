import logo from "../../../public/image.png";

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full relative z-10 animate-fade-in">
      <div className="flex items-center gap-2 text-xl font-bold mb-6 justify-center text-slate-100 text-glow">
        <img src={logo} alt="Logo" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
        Chat App
      </div>

      <div className="glass-panel rounded-2xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.05)] border-white/20">
        <h1 className="text-2xl font-bold text-slate-100 text-center text-glow">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-400 text-sm mt-1.5 mb-6 text-center">
            {subtitle}
          </p>
        )}
        {!subtitle && <div className="mb-6" />}

        {children}
      </div>
    </div>
  );
}

export default AuthCard;
