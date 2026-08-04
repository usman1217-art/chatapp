import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthCard from "../components/common/AuthCard";
import GoogleAuthButton from "../components/common/GoogleAuthButton";

import { loginUser } from "../services/authApi";
import { getCurrentUser } from "../services/userApi";
import { useAuth } from "../context/AuthContext";

import bgVideo from "../assets/login-bg.mp4"; 

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // State to track password visibility
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      const token = res.data.accessToken;
      localStorage.setItem("accessToken", token);

      const userRes = await getCurrentUser();
      login(token, userRes.data);

      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full relative overflow-x-hidden font-sans">
      
      {/* --- FULL SCREEN VIDEO BACKGROUND --- */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-indigo-900/20 dark:bg-[#0a192f]/40 z-10 mix-blend-overlay"></div>

      {/* --- LEFT SIDE: Branding Area --- */}
      <div className="hidden lg:flex w-1/2 relative z-20 items-center justify-center flex-col text-white p-12 text-center drop-shadow-2xl">
        <h1 className="text-6xl font-black mb-4 tracking-tight">Connect instantly.</h1>
        <p className="text-xl font-medium opacity-90 max-w-md">Experience real-time messaging with an ultra-modern glass interface.</p>
      </div>

      {/* --- RIGHT SIDE: FROSTED GLASS PANEL --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-20 overflow-y-auto bg-white/70 dark:bg-[#0a192f]/75 backdrop-blur-2xl border-l border-white/40 dark:border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.15)]">
        
        <div className="w-full max-w-md animate-fade-in py-4">
          
          {googleLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Authenticating</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Securing profile connection via Google...</p>
              </div>
            </div>
          ) : (
            <AuthCard title="Welcome back" subtitle="Log in to continue chatting">
              <form onSubmit={submit} className="space-y-4">
                
                <Input 
                  label="Email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
                
                <div className="space-y-1 relative">
                  <div className="relative">
                    {/* Input type toggles dynamically based on showPassword state */}
                    <Input 
                      label="Password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    
                    {/* Toggle Password Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 bottom-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-200 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="pt-3">
                  <Button type="submit" loading={loading}>Log in</Button>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700/60 transition-colors duration-300" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 select-none">OR</span>
                  <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700/60 transition-colors duration-300" />
                </div>

                <GoogleAuthButton setLoading={setGoogleLoading} />

                <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 pt-3">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-200 hover:underline ml-1">
                    Create one
                  </Link>
                </p>
              </form>
            </AuthCard>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;