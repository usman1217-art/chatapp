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

  const checkAuth = async () => {
    try {
      // Optional optimization: If you store a flag in localStorage upon login, 
      // you can skip calling /refresh entirely when logged out!
      const tokenRes = await refreshToken();
      const token = tokenRes.data.accessToken;
      localStorage.setItem("accessToken", token);
      
      const userRes = await getCurrentUser();
      setUser(userRes.data);
    } catch (err) {
      // Expected if logged out—silently clear everything without throwing errors
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
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
      <div className="flex h-screen w-full items-center justify-center bg-[#0a192f]">
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