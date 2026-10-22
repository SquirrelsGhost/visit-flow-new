import type { AuthUser } from "@visit-flow/shared/auth";
import { createContext } from "react";

export interface AuthError {
  type: "validation" | "server";
  message: string;
  field?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** true, solange beim Start eine bestehende Sitzung geprüft wird. */
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
