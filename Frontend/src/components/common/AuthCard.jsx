import logo from "../../../public/image.png";

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a192f] px-4 relative overflow-hidden">

      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">

        <div className="flex items-center gap-2 text-xl font-bold mb-6 justify-center text-slate-100">
          {/* <span className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          </span> */}
            <img src={logo} alt="Logo" className="w-8 h-8" />
          Chat App
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-2xl rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-slate-100 text-center">
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

    </div>
  );
}

export default AuthCard;
