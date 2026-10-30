import type { Language } from "../../lib/i18n/translationContext";
import { logbookDe } from "./logbookDe";
import { logbookDeForm } from "./logbookDeForm";
import { logbookEn } from "./logbookEn";
import { logbookEnForm } from "./logbookEnForm";

export const LOGBOOK_TEXTS = {
  de: { ...logbookDe, ...logbookDeForm },
  en: { ...logbookEn, ...logbookEnForm },
} as const;

export type LogbookTexts = (typeof LOGBOOK_TEXTS)["de"];

export const logbookTextsFor = (language: Language): LogbookTexts => LOGBOOK_TEXTS[language] ?? LOGBOOK_TEXTS.de;
