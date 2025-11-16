/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useEffect, useContext } from "react";
import authService from "../api/authService";
import toast from "react-hot-toast";

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize - check if user is already logged in
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      toast.success("Login successful!");
      // fetch user profile after login
      const profile = await authService.getProfile();
      setUser(profile);
      return data;
    } catch (error) {
      const errorMsg = error.detail || "Login failed. Please try again.";
      toast.error(errorMsg);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      toast.success("Registration successful! Please login.");
      return data;
    } catch (error) {
      const errorMsg = error.detail || "Registration failed. Please try again.";
      toast.error(errorMsg);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Logged out successfully");
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Refresh user profile
  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
