import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthCard from "../components/common/AuthCard";

import { registerUser } from "../services/authApi";

// Import your video file
import bgVideo from "../assets/login-bg.mp4"; 

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser({ name, email, password });

      toast.success(
        "Registration successful! Check your email to verify your account."
      );

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#0a192f] overflow-x-hidden">
      
      {/* --- VIDEO PANEL --- */}
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
        
        <div className="absolute inset-0 bg-[#0a192f]/20 z-10 mix-blend-overlay"></div>
      </div>

      {/* --- FORM PANEL --- */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-20 overflow-y-auto">
        
        <div className="w-full max-w-md animate-fade-in drop-shadow-xl py-4">
          <AuthCard title="Create your account" subtitle="Join and start chatting in seconds">
            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              <Button type="submit" loading={loading}>
                Create account
              </Button>

              <p className="text-center text-sm text-slate-400 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Log in
                </Link>
              </p>
            </form>
          </AuthCard>
        </div>

      </div>
    </div>
  );
}

export default Register;