import type { Metadata } from "next";
import D2dCalculatorView from "@/components/pseo/D2dCalculatorView";
import { MetaTagService } from "@/services/MetaTagService";
import { TranslationService } from "@/services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.D2dCalculatorSeoPage.MetaTags);
}

export default function D2dProvisionsabrechnungPage() {
  return <D2dCalculatorView />;
}
