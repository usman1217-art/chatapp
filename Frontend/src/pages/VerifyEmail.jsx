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
        setMessage(
          err.response?.data?.message || "Email verification failed"
        );
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#0a192f] px-6 text-center">
      {status === "loading" && (
        <>
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Verifying your email...</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">
            ✅
          </div>
          <h1 className="text-xl font-semibold text-slate-100">{message}</h1>
          <p className="text-slate-400 text-sm">Redirecting to login...</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-3xl">
            ❌
          </div>
          <h1 className="text-xl font-semibold text-slate-100">{message}</h1>
          <Link to="/login" className="text-indigo-400 font-medium hover:underline text-sm">
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
