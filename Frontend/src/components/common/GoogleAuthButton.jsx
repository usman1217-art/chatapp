import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { googleLogin } from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";

function GoogleAuthButton() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin({
        token: credentialResponse.credential,
      });

      login(res.data.accessToken, res.data.user);

      toast.success("Welcome!");

      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Google sign-in failed"
      );
    }
  };
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)  
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        title="Set VITE_GOOGLE_CLIENT_ID in Frontend/.env to enable Google sign-in"
        className="w-full py-3 rounded-xl border border-slate-700 text-slate-500 text-sm font-medium cursor-not-allowed"
      >
        Google sign-in not configured
      </button>
    );
  }

  return (
    <div className="flex justify-center [&>div]:w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google sign-in failed")}
        theme="filled_black"
        shape="pill"
        width="100%"
      />
    </div>
  );
}

export default GoogleAuthButton;
