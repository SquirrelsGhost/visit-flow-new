import { D2D_CITIES } from "@/lib/pseo/visitFlowCitiesData";
import { D2D_INDUSTRIES } from "@/lib/pseo/visitFlowPseoData";

const ORIGIN = "https://visit-flow.com";

const xmlEscape = (str: string): string =>
  str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] ?? c);

export async function GET(): Promise<Response> {
  const todayIso = "2026-11-03";

  const entries: { loc: string; priority: string; changefreq: string }[] = [
    { loc: `${ORIGIN}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${ORIGIN}/rechner/d2d-provisionsabrechnung`, priority: "0.95", changefreq: "weekly" },
    { loc: `${ORIGIN}/d2d-vertrieb`, priority: "0.95", changefreq: "weekly" },
    { loc: `${ORIGIN}/gebietsplanung`, priority: "0.95", changefreq: "weekly" },
    { loc: `${ORIGIN}/onboarding`, priority: "0.9", changefreq: "weekly" },
    { loc: `${ORIGIN}/login`, priority: "0.8", changefreq: "monthly" },
    { loc: `${ORIGIN}/blog`, priority: "0.9", changefreq: "daily" },
    { loc: `${ORIGIN}/en/blog`, priority: "0.85", changefreq: "daily" },
    { loc: `${ORIGIN}/tr/blog`, priority: "0.85", changefreq: "daily" },
    { loc: `${ORIGIN}/ar/blog`, priority: "0.85", changefreq: "daily" },
    { loc: `${ORIGIN}/ru/blog`, priority: "0.85", changefreq: "daily" },
    ...D2D_INDUSTRIES.map((ind) => ({
      loc: `${ORIGIN}/d2d-vertrieb/${ind.slug}`,
      priority: "0.9",
      changefreq: "weekly",
    })),
    ...D2D_CITIES.map((city) => ({
      loc: `${ORIGIN}/gebietsplanung/${city.slug}`,
      priority: "0.85",
      changefreq: "weekly",
    })),
  ];

  const urlBlocks = entries.map(
    (item) =>
      [
        "  <url>",
        `    <loc>${xmlEscape(item.loc)}</loc>`,
        `    <lastmod>${todayIso}</lastmod>`,
        `    <changefreq>${item.changefreq}</changefreq>`,
        `    <priority>${item.priority}</priority>`,
        "  </url>",
      ].join("\n"),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlBlocks,
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
