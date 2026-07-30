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
  );
}

export default Login;
