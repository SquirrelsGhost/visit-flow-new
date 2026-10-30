import type { Metadata } from "next";
import BackofficeView from "../../../components/backoffice/BackofficeView";
import { MetaTagService } from "../../../services/MetaTagService";
import { TranslationService } from "../../../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.BackofficePage.MetaTags);
}

interface TeamBackofficePageProps {
  searchParams: Promise<{ angebot?: string }>;
}

/** Team-Backoffice (/team-backoffice): Teamleiter prüfen die Verkäufe ihres Teams; Add-on für Teams. */
export default async function TeamBackofficePage({ searchParams }: TeamBackofficePageProps) {
  const { angebot } = await searchParams;
  return <BackofficeView teaser={angebot === "1"} />;
}
