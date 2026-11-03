import Link from "next/link";
import D2dCommissionCalculator from "@/components/pseo/D2dCommissionCalculator";
import PseoFooterSection from "@/components/pseo/PseoFooterSection";
import PseoHeaderNav from "@/components/pseo/PseoHeaderNav";
import type { D2dCityEntry } from "@/lib/pseo/visitFlowCitiesData";
import { D2D_CITIES } from "@/lib/pseo/visitFlowCitiesData";
import { D2D_INDUSTRIES } from "@/lib/pseo/visitFlowPseoData";

export interface D2dCityDetailViewProps {
  city: D2dCityEntry;
}

export default function D2dCityDetailView({ city }: D2dCityDetailViewProps) {
  const mfhHouseholds = Math.round(city.households * (city.multiFamilySharePct / 100));
  const efhHouseholds = city.households - mfhHouseholds;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `D2D Gebietsplanung & Außendienst-Software ${city.name}`,
    provider: { "@type": "Organization", name: "Visit Flow", url: "https://visit-flow.com" },
    areaServed: { "@type": "City", name: city.name },
    description: city.localInsight,
  };

  return (
    <div className="min-h-screen bg-[#07070b] text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PseoHeaderNav activeSection="cities" />

      <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <nav aria-label="Breadcrumb" className="text-xs text-zinc-400">
          <Link href="/" className="hover:text-white">Startseite</Link>
          <span className="mx-2">/</span>
          <Link href="/gebietsplanung" className="hover:text-white">Gebietsplanung</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-200">{city.name}</span>
        </nav>

        <div className="mt-6 max-w-4xl">
          <span className="inline-block rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
            {city.country} · {city.state} · {city.households.toLocaleString("de-DE")} Haushalte
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            D2D-Gebietsplanung & Vertriebsgebiete optimieren in {city.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
            {city.localInsight}
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-xs text-zinc-400">Haushalte gesamt</p>
            <p className="mt-1 text-xl font-bold text-white">{city.households.toLocaleString("de-DE")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-xs text-zinc-400">Mehrfamilienhäuser ({city.multiFamilySharePct}%)</p>
            <p className="mt-1 text-xl font-bold text-emerald-300">{mfhHouseholds.toLocaleString("de-DE")} WE</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-xs text-zinc-400">Ein-/Zweifamilienhäuser ({city.singleFamilySharePct}%)</p>
            <p className="mt-1 text-xl font-bold text-amber-300">{efhHouseholds.toLocaleString("de-DE")} HH</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-xs text-zinc-400">Empfohlene Teamstärke</p>
            <p className="mt-1 text-xl font-bold text-rose-300">{city.recommendedTeamSize}</p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Top-Bezirke & Fokus-Reviere in {city.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {city.topDistricts.map((dist) => (
                <span
                  key={dist}
                  className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-medium text-zinc-200"
                >
                  📍 {dist}
                </span>
              ))}
            </div>
            <p className="mt-5 text-xs text-zinc-400">
              <strong className="text-zinc-200">Glasfaser-Potenzial:</strong> {city.ftthPotentialLabel}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              <strong className="text-zinc-200">Solar-/PV-Potenzial:</strong> {city.solarRoofPotentialLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-rose-500/25 bg-rose-950/15 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Aktive Netzbetreiber & Carrier in {city.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {city.keyCarriers.map((car) => (
                <span
                  key={car}
                  className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-200"
                >
                  {car}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-zinc-300">
              Mit Visit Flow teilst du Straßenzüge in {city.name} überschneidungsfrei auf,
              trackst jede Wohneinheit live und erreichst bis zu {city.avgDoorsPerHour} Tür-Kontakte pro Stunde.
            </p>
            <Link
              href="/onboarding"
              className="mt-5 inline-block rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:from-rose-500 hover:to-red-400"
            >
              Reviere in {city.name} jetzt digital planen →
            </Link>
          </div>
        </section>

        <div className="mt-12">
          <D2dCommissionCalculator />
        </div>

        <section className="mt-12 flex flex-wrap gap-2">
          {D2D_INDUSTRIES.map((ind) => (
            <Link
              key={ind.slug}
              href={`/d2d-vertrieb/${ind.slug}`}
              className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20"
            >
              {ind.shortLabel} in {city.name} →
            </Link>
          ))}
          {D2D_CITIES.filter((c) => c.slug !== city.slug).slice(0, 10).map((other) => (
            <Link
              key={other.slug}
              href={`/gebietsplanung/${other.slug}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              Gebietsplanung {other.name}
            </Link>
          ))}
        </section>
      </main>

      <PseoFooterSection />
    </div>
  );
}
