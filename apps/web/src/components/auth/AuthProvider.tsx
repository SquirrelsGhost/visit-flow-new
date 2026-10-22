import type { AuthUser } from "@visit-flow/shared/auth";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { loginRequest, logoutRequest, restoreSession } from "../../lib/auth/authApi";
import { AuthContext, type AuthError } from "../../lib/auth/authContext";
import { forgetSession, rememberSession, shouldRestoreSession } from "../../lib/auth/sessionPrefs";
import { writePreference } from "../../lib/preferences";
import { loginTexts } from "../../texts/loginTexts";

interface AuthProviderProps {
  children: ReactNode;
}

/** Anmeldestatus der App. Prüft beim Start still, ob noch eine Sitzung besteht. */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(shouldRestoreSession);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    if (!shouldRestoreSession()) return;
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

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    setError(null);
    const response = await loginRequest(email, password);
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

  const logout = useCallback(async () => {
    await logoutRequest();
    forgetSession();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      error,
      login,
      logout,
      clearError,
    }),
    [user, isLoading, error, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
