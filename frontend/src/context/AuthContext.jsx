import { createContext, useState } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  needsProfileSetup: false,
  setNeedsProfileSetup: () => {},
  login: () => {},
  register: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("token") ? true : false
  );
  const [needsProfileSetup, setNeedsProfileSetup] = useState(
    localStorage.getItem("needsProfileSetup") === "true"
  );

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const register = (token, needsSetup = true) => {
    localStorage.setItem("token", token);
    localStorage.setItem("needsProfileSetup", needsSetup.toString());
    setIsAuthenticated(true);
    setNeedsProfileSetup(needsSetup);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("needsProfileSetup");
    setIsAuthenticated(false);
    setNeedsProfileSetup(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        needsProfileSetup,
        setNeedsProfileSetup,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};