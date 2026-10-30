import type { Metadata } from "next";
import LogbookView from "../../../components/logbook/LogbookView";
import { MetaTagService } from "../../../services/MetaTagService";
import { TranslationService } from "../../../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.LogbookPage.MetaTags);
}

/** Fahrtenbuch (/fahrtenbuch; v1 FahrtenbuchDialog im Assistenten). */
export default function LogbookPage() {
  return <LogbookView />;
}
