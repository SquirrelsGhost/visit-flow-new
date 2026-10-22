import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import LoginLoading from "../auth/LoginLoading";

interface RequireAuthProps {
  children: ReactNode;
}

/** Geschützte Seite: ohne Anmeldung geht es zum Login, danach zurück hierher (wie v1). */
export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoginLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
