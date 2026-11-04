import type { Metadata } from "next";
import WebsitePage from "../components/website/WebsitePage";
import { MetaTagService } from "../services/MetaTagService";
import { TranslationService } from "../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.WebsitePage.MetaTags);
}

/** Öffentliche Website. Die native App und die installierte Web-App leiten von hier direkt in die App weiter. */
export default function RootPage() {
  return <WebsitePage />;
}
