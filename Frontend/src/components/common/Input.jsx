function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      <input
        className={`w-full bg-slate-800/80 border rounded-xl p-3 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-100 placeholder:text-slate-500 ${
          error ? "border-red-500/60" : "border-slate-700"
        } ${className}`}
        {...props}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default Input;
