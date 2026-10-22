// Prüft den Anmeldestatus und leitet im Browser um
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import LoginLoading from "../auth/LoginLoading";

interface RequireAuthProps {
  children: ReactNode;
}

/** Geschützte Seite: ohne Anmeldung geht es zum Login, danach zurück hierher (wie v1). */
export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const mustLogin = !isLoading && !isAuthenticated;

  useEffect(() => {
    if (!mustLogin) return;
    const from = `${pathname}${search ? `?${search}` : ""}`;
    router.replace(`/login?from=${encodeURIComponent(from)}`);
  }, [mustLogin, pathname, search, router]);

  if (!isAuthenticated) return <LoginLoading />;
  return children;
}
