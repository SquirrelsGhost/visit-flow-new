import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Permission } from "@/types/permissions.types";
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
  /** Aktuell wirksame Capabilities des angemeldeten Nutzers. */
  permissions?: Permission[];
  /** Prüft, ob der Nutzer eine bestimmte Capability besitzt (`hasPermission`). */
  can?: (permission: Permission) => boolean;
  login: (email: string, password: string, rememberMe: boolean, honeypot?: string) => Promise<{ success: boolean }>;
  /** Meldet lokal ohne API als Demo-Admin an (nur in der Entwicklung sichtbar). */
  loginDemo: () => void;
  logout: () => Promise<void>;
  /** Übernimmt gespeicherte Profiländerungen in den angemeldeten Benutzer (v1 updateUser für sich selbst). */
  updateUser: (patch: Partial<AuthUser>) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
