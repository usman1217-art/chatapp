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

// Import your video file (adjust path if needed)
import bgVideo from "../assets/login-bg.mp4"; 

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    // Uses a column layout on mobile (video top, form bottom) and a row layout on desktop
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#0a192f] overflow-x-hidden">
      
      {/* --- VIDEO PANEL --- */}
      {/* Mobile: Top banner (35vh height) | Desktop: Left panel (50% width, full height) */}
      <div className="w-full h-[35vh] lg:h-screen lg:w-1/2 xl:w-[60%] relative shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 shadow-2xl">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
        
        {/* Navy color overlay to match your app theme */}
        <div className="absolute inset-0 bg-[#0a192f]/20 z-10 mix-blend-overlay"></div>
      </div>

      {/* --- FORM PANEL --- */}
      {/* Mobile: Fills remaining space below video | Desktop: Right panel (50% width) */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-20 overflow-y-auto">
        
        <div className="w-full max-w-md animate-fade-in drop-shadow-xl py-4">
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

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex justify-end -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" loading={loading}>
                Log in
              </Button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-500">OR</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <GoogleAuthButton />

              <p className="text-center text-sm text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Create one
                </Link>
              </p>
            </form>
          </AuthCard>
        </div>

      </div>
    </div>
  );
}

export default Login;