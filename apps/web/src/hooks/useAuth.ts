import { useContext } from "react";
import { AuthContext } from "../lib/auth/authContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden");
  return context;
}
