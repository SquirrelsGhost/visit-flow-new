import type { Metadata } from "next";
import StreetListView from "../../../components/streets/StreetListView";
import { MetaTagService } from "../../../services/MetaTagService";
import { TranslationService } from "../../../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.StreetListPage.MetaTags.admin);
}

/** Straßenliste (/admin-street-list): gemeinsame Seite, Sicht "admin". */
export default function AdminStreetListPage() {
  return <StreetListView view="admin" />;
}
