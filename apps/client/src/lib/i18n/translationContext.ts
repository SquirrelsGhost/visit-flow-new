import { createContext } from "react";
import type { TranslationKey } from "../../texts/i18n/de";

export type Language = "de" | "en";

export interface TranslationContextValue {
  t: (key: TranslationKey) => string;
  language: Language;
  setLanguage: (language: Language) => void;
}

export const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);
