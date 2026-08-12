function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      <input
        className={`glass-input w-full rounded-xl p-3 ${
          error ? "border-red-500/60 focus:border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        {...props}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default Input;
