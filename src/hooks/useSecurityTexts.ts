import { securitySessionTextsDe } from "../texts/securitySessionTexts";
import { securitySessionTextsEn } from "../texts/securitySessionTextsEn";
import { securityTextsDe } from "../texts/securityTexts";
import { securityTextsEn } from "../texts/securityTextsEn";
import { useTranslation } from "./useTranslation";

const DE = { ...securityTextsDe, ...securitySessionTextsDe };
const EN: typeof DE = { ...securityTextsEn, ...securitySessionTextsEn };

export type SecurityTexts = typeof DE;

/** Texte des Security Dashboards in der gewählten App-Sprache (Deutsch oder Englisch). */
export function useSecurityTexts(): SecurityTexts {
  return useTranslation().language === "en" ? EN : DE;
}

/** Datum und Uhrzeit kurz in der Sprache der Texte, z. B. 24.10., 21:40. */
export function formatStamp(t: SecurityTexts, time: string | number, withDate = true): string {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return "–";
  return date.toLocaleString(t.locale, withDate ? { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" } : { hour: "2-digit", minute: "2-digit" });
}
