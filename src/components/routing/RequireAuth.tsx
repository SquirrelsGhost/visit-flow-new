// Prüft den Anmeldestatus sowie optionale Zero-Trust Capabilities und leitet im Browser um
"use client";

import type { Permission } from "@/types/permissions.types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { effectiveUserPermissions, hasPermission } from "../../lib/permissions";
import LoginLoading from "../auth/LoginLoading";

interface RequireAuthProps {
  children: ReactNode;
  permission?: Permission;
}

/** Geschützte Seite: ohne Anmeldung geht es zum Login, ohne erforderliche Capability zum Dashboard. */
export default function RequireAuth({ children, permission }: RequireAuthProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const mustLogin = !isLoading && !isAuthenticated;
  const userPerms = effectiveUserPermissions(user);
  const lacksCapability = !isLoading && isAuthenticated && Boolean(permission && !hasPermission(userPerms, permission));

  useEffect(() => {
    if (mustLogin) {
      const from = `${pathname}${search ? `?${search}` : ""}`;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
      return;
    }
    if (lacksCapability) {
      router.replace("/dashboard");
    }
  }, [mustLogin, lacksCapability, pathname, search, router]);

  if (!isAuthenticated || lacksCapability) return <LoginLoading />;
  return children;
}
