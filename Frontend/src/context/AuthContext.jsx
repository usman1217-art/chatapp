import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import { refreshToken, logoutUser } from "../services/authApi";
import { getCurrentUser } from "../services/userApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent duplicate auth check
  const hasChecked = useRef(false);

  const checkAuth = async (isRetry = false) => {
    try {
      const tokenRes = await refreshToken();
      const token = tokenRes.data.accessToken;

      localStorage.setItem("accessToken", token);

      const userRes = await getCurrentUser();
      setUser(userRes.data);
    } catch (err) {
      const status = err?.response?.status;

      if (status !== 401 && !isRetry) {
        setTimeout(() => checkAuth(true), 1500);
        return;
      }

      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasChecked.current) return;

    hasChecked.current = true;
    checkAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("accessToken", token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {}

    localStorage.removeItem("accessToken");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-transparent transition-colors duration-300 gap-5">
        <img src="/image.png" alt="Loading..." className="w-24 h-32 object-cover rounded-xl animate-[pulse_1.5s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] dark:drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
        <p className="text-slate-900 dark:text-slate-400 font-bold tracking-widest text-xs uppercase animate-pulse">Connecting...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);