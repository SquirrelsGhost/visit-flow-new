import type { Metadata } from "next";
import ExpiringView from "../../../components/expiring/ExpiringView";
import { MetaTagService } from "../../../services/MetaTagService";
import { TranslationService } from "../../../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.ExpiringPage.MetaTags);
}

/** Verträge vor Ablauf für Admins (/expiring-contracts, v1 ExpiringContractsPage). */
export default function ExpiringContractsPage() {
  return <ExpiringView />;
}
