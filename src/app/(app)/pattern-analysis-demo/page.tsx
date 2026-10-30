import type { Metadata } from "next";
import AssistantView from "../../../components/assistant/AssistantView";
import { MetaTagService } from "../../../services/MetaTagService";
import { TranslationService } from "../../../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.AssistantPage.MetaTags);
}

/** Assistent (/pattern-analysis-demo, v1 PatternAnalysisDemoPage): KI-Wissen, eigene Zahlen und D2D-Werkzeuge. */
export default function AssistantPage() {
  return <AssistantView />;
}
