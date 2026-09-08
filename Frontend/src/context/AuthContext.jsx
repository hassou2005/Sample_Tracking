import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Vider les états d'authentification ET l'historique du scanner
  const clearAuthState = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Supprimer tous les historiques de scanner stockés
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("labtrack_scanner_session_")) {
        localStorage.removeItem(key);
      }
    });

    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (storedToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        } catch (error) {
          if (storedRefreshToken) {
            try {
              const refreshData = await authService.refreshToken(storedRefreshToken);
              setToken(refreshData.access_token);
              setUser(refreshData.user);
              localStorage.setItem("token", refreshData.access_token);
              if (refreshData.refresh_token) {
                localStorage.setItem("refreshToken", refreshData.refresh_token);
              }
              localStorage.setItem("user", JSON.stringify(refreshData.user));
            } catch (refreshErr) {
              console.warn("Persistent session restoration failed:", refreshErr);
              clearAuthState();
            }
          } else {
            clearAuthState();
          }
        }
      } else if (storedRefreshToken) {
        try {
          const refreshData = await authService.refreshToken(storedRefreshToken);
          setToken(refreshData.access_token);
          setUser(refreshData.user);
          localStorage.setItem("token", refreshData.access_token);
          if (refreshData.refresh_token) {
            localStorage.setItem("refreshToken", refreshData.refresh_token);
          }
          localStorage.setItem("user", JSON.stringify(refreshData.user));
        } catch (refreshErr) {
          console.warn("Refresh token session expired:", refreshErr);
          clearAuthState();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const data = await authService.login(email, password, rememberMe);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refreshToken", data.refresh_token);
    }
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (userData) => {
    const newUser = await authService.register(userData);
    if (userData.email && userData.password) {
      await login(userData.email, userData.password, true);
    }
    return newUser;
  };

  const logout = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    try {
      await authService.logout(storedRefreshToken);
    } catch (e) {
      console.error("Logout error:", e);
    }
    clearAuthState();
    window.location.href = "/login";
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "ADMIN",
    isTechnician: user?.role === "TECHNICIAN" || user?.role === "PROFESSOR" || user?.role === "ADMIN",
    login,
    register,
    logout,
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