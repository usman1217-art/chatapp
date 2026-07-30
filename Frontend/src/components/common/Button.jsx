function Button({
  children,
  type = "button",
  className = "",
  loading = false,
  disabled = false,
  variant = "primary",
  ...props
}) {
  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

export default Button;
