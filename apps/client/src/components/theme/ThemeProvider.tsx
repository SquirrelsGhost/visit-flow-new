import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { readPreference, writePreference } from "../../lib/preferences";
import { applyTheme, THEME_STORAGE_KEY, ThemeContext, type Theme } from "../../lib/theme/themeContext";

interface ThemeProviderProps {
  children: ReactNode;
}

/** Hell/Dunkel wie in v1: Standard hell, Wahl bleibt im Gerät gespeichert (Schlüssel "theme"). */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => (readPreference(THEME_STORAGE_KEY) === "dark" ? "dark" : "light"));

  useEffect(() => {
    applyTheme(theme);
    writePreference(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(() => setThemeState((current) => (current === "light" ? "dark" : "light")), []);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
