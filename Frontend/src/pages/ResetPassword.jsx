import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import AuthCard from "../components/common/AuthCard";

import { resetPassword } from "../services/authApi";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, { password });
      toast.success("Password updated. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset password" subtitle="Choose a new password for your account">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />

        <Button type="submit" loading={loading}>
          Update password
        </Button>

        <p className="text-center text-sm text-slate-400">
          <Link to="/login" className="text-indigo-400 font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default ResetPassword;
