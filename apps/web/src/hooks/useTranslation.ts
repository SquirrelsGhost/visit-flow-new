import { useContext } from "react";
import { TranslationContext } from "../lib/i18n/translationContext";

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useTranslation muss innerhalb von TranslationProvider verwendet werden");
  return context;
}
