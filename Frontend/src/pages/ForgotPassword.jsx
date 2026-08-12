import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthCard from "../components/common/AuthCard";

import { forgotPassword } from "../services/authApi";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Forgot password" subtitle="We'll email you a link to reset it">
      {sent ? (
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-2xl">
            ✅
          </div>
          <p className="text-slate-300 text-sm">
            If an account exists for <b>{email}</b>, a reset link is on its way.
          </p>
          <Link to="/login" className="text-slate-900 dark:text-white font-bold hover:underline text-sm">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" loading={loading}>
            Send reset link
          </Button>

          <p className="text-center text-sm text-slate-400">
            Remembered your password?{" "}
            <Link to="/login" className="text-slate-900 dark:text-white font-bold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}

export default ForgotPassword;
