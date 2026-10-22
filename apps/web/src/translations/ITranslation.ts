import type { IMetaTags } from "../services/MetaTagService";

/**
 * Serverseitige Übersetzungen (Meta-Tags je Seite) nach dem Muster des Next.js-Fundaments.
 * Jede Sprache muss jeden Schlüssel liefern, sonst bricht der Typecheck ab.
 * Texte in der App selbst liegen weiter in src/texts/.
 */
export interface ITranslation {
  LoginPage: {
    MetaTags: IMetaTags;
  };

  DashboardPage: {
    MetaTags: IMetaTags;
  };
}
