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
      "glass-button",
    secondary:
      "glass-panel hover:bg-white/10 text-slate-200 border-white/20",
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
