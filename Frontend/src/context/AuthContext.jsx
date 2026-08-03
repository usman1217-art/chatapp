import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { refreshToken, logoutUser } from "../services/authApi";
import { getCurrentUser } from "../services/userApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async (isRetry = false) => {
    const savedToken = localStorage.getItem("accessToken");
    
    // Optimization: If no token exists at all, skip the refresh call immediately
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const tokenRes = await refreshToken();
      const token = tokenRes.data.accessToken;
      localStorage.setItem("accessToken", token);
      
      const userRes = await getCurrentUser();
      setUser(userRes.data);
      setLoading(false);
    } catch (err) {
      const status = err?.response?.status;

      // Transient failure (network drop, cold-starting backend, rate limit) —
      // retry once before giving up, instead of instantly logging out.
      if (status !== 401 && !isRetry) {
        setTimeout(() => checkAuth(true), 1500);
        return; // keep the spinner up until the retry resolves
      }

      // FIX (logout on refresh): this used to clear the session on ANY error
      // from /auth/refresh — including a dropped connection, the backend
      // still waking up (Render free tier), or hitting the rate limiter —
      // which logged a perfectly valid user out just for refreshing the
      // page. Only treat it as "logged out" when the server explicitly says
      // the token itself is invalid/expired (401).
      if (status === 401) {
        localStorage.removeItem("accessToken");
        setUser(null);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
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
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0a192f] transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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