import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MetaTagService } from "../services/MetaTagService";
import { TranslationService } from "../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.DashboardPage.MetaTags);
}

/** Die Website kommt später. Bis dahin startet die App direkt in der Laufliste (ohne Anmeldung geht es zum Login). */
export default function RootPage() {
  redirect("/dashboard");
}
