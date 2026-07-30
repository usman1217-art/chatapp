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
  
        const tokenRes = await refreshToken();
  
        const token = tokenRes.data.accessToken;
  
        localStorage.setItem("accessToken", token);
  
        const userRes = await getCurrentUser();
  
        setUser(userRes.data);
  
      } catch (err) {
  
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