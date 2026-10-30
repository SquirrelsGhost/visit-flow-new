import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Permission } from "@/types/permissions.types";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { loginRequest, logoutRequest, restoreSession } from "../../lib/auth/authApi";
import { AuthContext, type AuthError } from "../../lib/auth/authContext";
import { DEMO_ADMIN, hasDemoSession, setDemoSession } from "../../lib/auth/demoSession";
import { forgetSession, rememberSession, shouldRestoreSession } from "../../lib/auth/sessionPrefs";
import { effectiveUserPermissions, hasPermission } from "../../lib/permissions";
import { writePreference } from "../../lib/preferences";
import { loginTexts } from "../../texts/loginTexts";

interface AuthProviderProps {
  children: ReactNode;
}

/** Anmeldestatus der App inkl. Zero-Trust Capabilities (`permissions` & `can`). */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => (hasDemoSession() ? DEMO_ADMIN : null));
  const [isLoading, setIsLoading] = useState(() => !hasDemoSession() && shouldRestoreSession());
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    if (hasDemoSession() || !shouldRestoreSession()) return;
    let active = true;
    void restoreSession()
      .then((restored) => {
        if (!active) return;
        setUser(restored);
        if (!restored) forgetSession();
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean, honeypot = "") => {
    if (honeypot.trim() !== "") {
      setError({ type: "server", message: "Anfrage durch Bot-Filter abgewiesen." });
      return { success: false };
    }
    setError(null);
    const response = await loginRequest(email, password, honeypot);
    if (!response.success) {
      setError({
        type: "server",
        message: response.error || response.message || loginTexts.loginFailed,
      });
      return { success: false };
    }
    const { user: loggedIn, showTeamLeiterLiveTracking } = response.data;
    rememberSession(rememberMe);
    writePreference("showTeamLeiterLiveTracking", String(showTeamLeiterLiveTracking ?? true));
    setUser(loggedIn);
    toast.success(loginTexts.welcome(loggedIn.name || email));
    return { success: true };
  }, []);

  const loginDemo = useCallback(() => {
    setError(null);
    setDemoSession(true);
    setUser(DEMO_ADMIN);
    toast.success(loginTexts.welcome(DEMO_ADMIN.name ?? DEMO_ADMIN.email));
  }, []);

  const logout = useCallback(async () => {
    if (hasDemoSession()) setDemoSession(false);
    else await logoutRequest();
    forgetSession();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return null;
      const next = { ...current, ...patch };
      return { ...next, permissions: effectiveUserPermissions(next) };
    });
  }, []);

  const permissions = useMemo(() => effectiveUserPermissions(user), [user]);
  const can = useCallback((required: Permission) => hasPermission(permissions, required), [permissions]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null && !user.banned,
      isLoading,
      error,
      permissions,
      can,
      login,
      loginDemo,
      logout,
      clearError,
      updateUser,
    }),
    [user, isLoading, error, permissions, can, login, loginDemo, logout, clearError, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
