import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { verifyEmail } from "../services/authApi";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Email verification failed");
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-transparent transition-colors duration-300 px-6 text-center">
      {status === "loading" && (
        <>
          <div className="w-12 h-12 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Verifying your email...</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-3xl shadow-sm">✅</div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{message}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Redirecting to login...</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-3xl shadow-sm">❌</div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{message}</h1>
          <Link to="/login" className="text-slate-900 dark:text-white font-bold hover:underline text-sm">
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;