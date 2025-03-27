import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import auth from "../api/auth"; 

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const login = async (email, password) => {
    try {
      const response = await auth.login(email, password);
      localStorage.setItem("token", response.data.key);
      context.setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("needsProfileSetup");
      context.setIsAuthenticated(false);
      // If setNeedsProfileSetup exists in context, call it
      if (context.setNeedsProfileSetup) {
        context.setNeedsProfileSetup(false);
      }
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      localStorage.removeItem("token");
      localStorage.removeItem("needsProfileSetup");
      context.setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (username, email, password1, password2) => {
    try {
      const response = await auth.register(username, email, password1, password2);
      // After successful registration, store the token
      localStorage.setItem("token", response.data.key);
      
      // Set the flag that user needs to complete profile
      localStorage.setItem("needsProfileSetup", "true");
      
      // Update auth state
      context.setIsAuthenticated(true);
      
      // If setNeedsProfileSetup exists in context, call it
      if (context.setNeedsProfileSetup) {
        context.setNeedsProfileSetup(true);
      }
      
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // Add password reset function
  const resetPassword = async (email) => {
    try {
      const response = await auth.resetPassword(email);
      return response.data;
    } catch (error) {
      console.error("Password reset failed:", error.response?.data || error.message);
      throw error;
    }
  };

  return { ...context, login, logout, register, resetPassword };
};