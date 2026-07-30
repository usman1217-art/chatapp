import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthCard from "../components/common/AuthCard";
import GoogleAuthButton from "../components/common/GoogleAuthButton";

import { registerUser } from "../services/authApi";

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

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-500">OR</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <GoogleAuthButton />

        <p className="text-center text-sm text-slate-400">
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
  );
}

export default Register;
