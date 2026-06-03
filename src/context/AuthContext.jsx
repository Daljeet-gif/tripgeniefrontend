import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_URL}/users/profile`,
            { headers: { Authorization: `Bearer ${storedToken}` } }
          );
          setUser(data.user);
          setToken(storedToken);
        } catch {
          // Token might be expired, try to refresh
          await refreshToken();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const refreshToken = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken = data.accessToken;
      localStorage.setItem("accessToken", newToken);
      setToken(newToken);
      
      // Fetch user data with new token
      const { data: userData } = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        { headers: { Authorization: `Bearer ${newToken}` } }
      );
      setUser(userData.user);
      return newToken;
    } catch {
      // Refresh failed, clear auth
      logout();
      return null;
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/users/login`,
      { email, password },
      { withCredentials: true }
    );
    localStorage.setItem("accessToken", data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/users/register`,
      { name, email, password }
    );
    return data;
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const { data } = await axios.put(
      `${import.meta.env.VITE_API_URL}/users/profile`,
      profileData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUser(data.user);
    return data;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
