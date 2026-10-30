import { logbookTextsFor, type LogbookTexts } from "../texts/logbook/logbookTexts";
import { useTranslation } from "./useTranslation";

/** Texte des Fahrtenbuchs in der eingestellten Sprache (Deutsch oder Englisch). */
export function useLogbookTexts(): LogbookTexts {
  return logbookTextsFor(useTranslation().language);
}
