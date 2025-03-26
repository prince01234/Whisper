import { createContext } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  login: () => {},
  register: () => {},
  logout: () => {}});