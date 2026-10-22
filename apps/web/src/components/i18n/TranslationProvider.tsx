import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { de, type TranslationKey } from "../../texts/i18n/de";
import { en } from "../../texts/i18n/en";
import { TranslationContext, type Language } from "../../lib/i18n/translationContext";
import { readPreference, writePreference } from "../../lib/preferences";

const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = { de, en };
const STORAGE_KEY = "language";

interface TranslationProviderProps {
  children: ReactNode;
}

/** Übersetzungen wie in v1: t(schlüssel), Standardsprache Deutsch. */
export default function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguageState] = useState<Language>(() =>
    readPreference(STORAGE_KEY) === "en" ? "en" : "de",
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    writePreference(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => {
    const table = TRANSLATIONS[language];
    return { language, setLanguage, t: (key: TranslationKey) => table[key] ?? key };
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}
