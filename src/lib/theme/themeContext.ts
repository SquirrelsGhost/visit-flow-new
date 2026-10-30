import { createContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
export const THEME_STORAGE_KEY = "theme";

/** Setzt die Klasse auf <html> ohne Übergangsanimation, wie in v1. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.transition = "none";
  void root.offsetHeight;
  requestAnimationFrame(() => {
    root.style.transition = "";
  });
}
