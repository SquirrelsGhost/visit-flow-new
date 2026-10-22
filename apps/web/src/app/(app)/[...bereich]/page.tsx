import type { Metadata } from "next";
import PendingArea from "../../../components/layout/PendingArea";
import { MetaTagService } from "../../../services/MetaTagService";
import { TranslationService } from "../../../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.PendingPage.MetaTags);
}

/** Bereiche aus der unteren Navigation und dem Menü, die noch nicht aus v1 übernommen sind. */
export default function PendingPage() {
  return <PendingArea />;
}
