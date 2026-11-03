import type { Metadata } from "next";
import { notFound } from "next/navigation";
import D2dCityDetailView from "@/components/pseo/D2dCityDetailView";
import { findD2dCityBySlug } from "@/lib/pseo/visitFlowCitiesData";
import { MetaTagService } from "@/services/MetaTagService";
import { TranslationService } from "@/services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

interface GebietsplanungCityPageProps {
  params: Promise<{ stadt: string }>;
}

export async function generateMetadata({ params }: GebietsplanungCityPageProps): Promise<Metadata> {
  const { stadt } = await params;
  const city = findD2dCityBySlug(stadt);
  if (!city) {
    const t = await TranslationService.GetUserTranslations();
    return MetaTagService.CreateMetaTags(t.D2dCityHubSeoPage.MetaTags);
  }
  const hhFormatted = city.households.toLocaleString("de-DE");
  return MetaTagService.CreateMetaTags({
    title: `Vertriebsgebiete optimieren ${city.name} (${hhFormatted} Haushalte) – D2D Gebietsplanung | Visit Flow`,
    description: `D2D Gebietsplanung ${city.name}: ${hhFormatted} Haushalte (${city.multiFamilySharePct}% MFH / ${city.singleFamilySharePct}% EFH), Ø ${city.avgDoorsPerHour} Türen/Std., Top-Bezirke & Glasfaser-/Solar-Potenzial.`,
    imgUrl: "https://visit-flow.com/og.png",
    tags: [
      `D2D Gebietsplanung ${city.name}`,
      `Vertriebsgebiete optimieren ${city.name}`,
      `Haustürvertrieb ${city.name}`,
      `Glasfaser Vertrieb ${city.name}`,
      "Visit Flow",
    ],
    url: `https://visit-flow.com/gebietsplanung/${city.slug}`,
  });
}

export default async function GebietsplanungCityPage({ params }: GebietsplanungCityPageProps) {
  const { stadt } = await params;
  const city = findD2dCityBySlug(stadt);
  if (!city) {
    notFound();
  }
  return <D2dCityDetailView city={city} />;
}
