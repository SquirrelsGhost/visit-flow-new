import { cookies, headers } from "next/headers";
import type { ITranslation } from "../translations/ITranslation";
import { Locale, Translations } from "../translations/Translations";

/**
 * TranslationService
 *
 * Reads the user's locale from (in priority order):
 *   1. Cookie  "MANUAL_NEXT_LOCALE"  — set when the user manually switches language
 *   2. Accept-Language header        — the browser's preferred language
 *   3. Fallback: DE
 *
 * Usage in a Server Component:
 *
 *   const t = await TranslationService.GetUserTranslations();
 *   return <h1>{t.HomePage.Headline}</h1>;
 */
export class TranslationService {
  static GetUserLocale = async (): Promise<Locale> => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("MANUAL_NEXT_LOCALE")?.value;

    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language") ?? "";
    const headerLocale = acceptLanguage.split(",")[0]?.split(";")[0] ?? "de";

    const userLocale = cookieLocale ?? headerLocale;
    return TranslationService.NormalizeLocale(userLocale);
  };

  static NormalizeLocale = (code: string): Locale => {
    switch (code) {
      case "en-US":
      case "en":
        return Locale.EN;
      case "de-DE":
      case "de":
        return Locale.DE;
      default:
        return Locale.DE;
    }
  };

  static GetTranslations = (locale: Locale): ITranslation => {
    return Translations[locale] ?? Translations[Locale.DE];
  };

  static GetUserTranslations = async (): Promise<ITranslation> => {
    const locale = await TranslationService.GetUserLocale();
    return TranslationService.GetTranslations(locale);
  };
}
