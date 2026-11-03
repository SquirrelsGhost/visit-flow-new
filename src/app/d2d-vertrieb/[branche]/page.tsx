import type { Metadata } from "next";
import { notFound } from "next/navigation";
import D2dIndustryDetailView from "@/components/pseo/D2dIndustryDetailView";
import { findD2dIndustryBySlug } from "@/lib/pseo/visitFlowPseoData";
import { MetaTagService } from "@/services/MetaTagService";
import { TranslationService } from "@/services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

interface D2dIndustryPageProps {
  params: Promise<{ branche: string }>;
}

export async function generateMetadata({ params }: D2dIndustryPageProps): Promise<Metadata> {
  const { branche } = await params;
  const industry = findD2dIndustryBySlug(branche);
  if (!industry) {
    const t = await TranslationService.GetUserTranslations();
    return MetaTagService.CreateMetaTags(t.D2dIndustryHubSeoPage.MetaTags);
  }
  return MetaTagService.CreateMetaTags({
    title: industry.metaTitle,
    description: industry.metaDescription,
    imgUrl: "https://visit-flow.com/og.png",
    tags: industry.keywords,
    url: `https://visit-flow.com/d2d-vertrieb/${industry.slug}`,
  });
}

export default async function D2dIndustryPage({ params }: D2dIndustryPageProps) {
  const { branche } = await params;
  const industry = findD2dIndustryBySlug(branche);
  if (!industry) {
    notFound();
  }
  return <D2dIndustryDetailView industry={industry} />;
}
