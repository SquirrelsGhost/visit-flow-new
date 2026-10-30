import { useContext } from "react";
import { TranslationContext } from "../lib/i18n/translationContext";
import { formTextsDe, type FormTexts } from "../texts/formTextsDe";
import { formTextsEn } from "../texts/formTextsEn";

/** Texte der Vodafone-Formulare in der gewählten Sprache; ohne TranslationProvider (Tests) deutsch. */
export function useFormTexts(): FormTexts {
  const language = useContext(TranslationContext)?.language ?? "de";
  return language === "en" ? formTextsEn : formTextsDe;
}
