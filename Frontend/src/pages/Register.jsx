import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthCard from "../components/common/AuthCard";
import { registerUser } from "../services/authApi";

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
      toast.success("Registration successful! Check your email to verify your account.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white dark:bg-[#0a192f] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-500 overflow-x-hidden antialiased">
      
      {/* --- LEFT SIDE: 50% VIDEO PANEL --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-slate-200 dark:border-slate-800">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-indigo-900/5 dark:bg-[#0a192f]/40 backdrop-blur-[1px] transition-colors duration-500"></div>
      </div>

      {/* --- RIGHT SIDE: 50% FORM PANEL --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20 overflow-y-auto">
        <div className="w-full max-w-[400px] animate-slide-up">
          <AuthCard title="Create your account" subtitle="Join and start chatting in seconds">
            <form onSubmit={submit} className="space-y-4">
              <Input label="Name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              
              <div className="pt-2">
                <Button type="submit" loading={loading}>Create account</Button>
              </div>

              <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-3">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-200 hover:underline ml-1">
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