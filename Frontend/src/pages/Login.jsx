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
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-[#0a192f] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-500 overflow-hidden antialiased">
      
      {/* --- LEFT SIDE: 50% VIDEO PANEL --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-slate-200 dark:border-slate-800">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-indigo-900/5 dark:bg-[#0a192f]/40 backdrop-blur-[1px] transition-colors duration-500"></div>
      </div>

      {/* --- RIGHT SIDE: 50% FORM PANEL --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20 overflow-y-auto">
        <div className="w-full max-w-[400px] animate-fade-in">
          
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
                <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                
                <div className="space-y-1 relative">
                  <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 transition-colors duration-300" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">OR</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 transition-colors duration-300" />
                </div>

                <GoogleAuthButton setLoading={setGoogleLoading} />

                <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-3">
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