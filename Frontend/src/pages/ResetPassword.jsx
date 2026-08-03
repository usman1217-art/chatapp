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
    if (password !== confirmPassword) return toast.error("Passwords do not match");
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a192f] transition-colors duration-500 font-sans antialiased">
      <div className="w-full max-w-[420px] animate-slide-up">
        <AuthCard title="Reset password" subtitle="Choose a new password for your account">
          <form onSubmit={submit} className="space-y-4">
            <Input label="New password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            <Input label="Confirm password" type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
            
            <div className="pt-2">
              <Button type="submit" loading={loading}>Update password</Button>
            </div>
            
            <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-2">
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-200 hover:underline">Back to login</Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}

export default ResetPassword;