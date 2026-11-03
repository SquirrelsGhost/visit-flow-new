import Link from "next/link";
import D2dCommissionCalculator from "@/components/pseo/D2dCommissionCalculator";
import PseoFooterSection from "@/components/pseo/PseoFooterSection";
import PseoHeaderNav from "@/components/pseo/PseoHeaderNav";
import { D2D_CITIES } from "@/lib/pseo/visitFlowCitiesData";
import type { D2dIndustryEntry } from "@/lib/pseo/visitFlowPseoData";
import { D2D_INDUSTRIES } from "@/lib/pseo/visitFlowPseoData";

export interface D2dIndustryDetailViewProps {
  industry: D2dIndustryEntry;
}

export default function D2dIndustryDetailView({ industry }: D2dIndustryDetailViewProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `Visit Flow – ${industry.name}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        url: `https://visit-flow.com/d2d-vertrieb/${industry.slug}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: industry.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  const kpis = [
    { label: "Ø Provision je Abschluss", val: industry.avgCommissionEur, cls: "text-white" },
    { label: "Ø Erfolgsquote", val: industry.avgConversionRate, cls: "text-emerald-300" },
    { label: "Ø Schlagzahl / Tag", val: industry.avgDoorsPerDay, cls: "text-white" },
    { label: "Qualitäts-Hebel", val: industry.stornoReduction, cls: "text-rose-300" },
  ];

  return (
    <div className="min-h-screen bg-[#07070b] text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PseoHeaderNav activeSection="industries" />

      <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <nav aria-label="Breadcrumb" className="text-xs text-zinc-400">
          <Link href="/" className="hover:text-white">Startseite</Link>
          <span className="mx-2">/</span>
          <Link href="/d2d-vertrieb" className="hover:text-white">D2D-Branchen</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-200">{industry.name}</span>
        </nav>

        <div className="mt-6 max-w-4xl">
          <span className="inline-block rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
            {industry.badge}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            {industry.heroTitle}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">{industry.heroSubtitle}</p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
              <p className="text-xs text-zinc-400">{k.label}</p>
              <p className={`mt-1 text-xl font-bold ${k.cls}`}>{k.val}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Typische Bremsklötze im {industry.shortLabel}-Außendienst</h2>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {industry.painPoints.map((pt) => (
                <li key={pt} className="flex gap-3">
                  <span className="mt-0.5 text-rose-400">✕</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-emerald-500/25 bg-emerald-950/15 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Wie Visit Flow dein {industry.shortLabel}-Team skaliert</h2>
            <div className="mt-4 space-y-4">
              {industry.solutions.map((sol) => (
                <div key={sol.title} className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <h3 className="text-sm font-bold text-emerald-300">✓ {sol.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">{sol.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Praxis-Einwandbehandlung ({industry.shortLabel})</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {industry.objectionPlaybook.map((obj) => (
              <div key={obj.objection} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-xs font-semibold text-amber-300">{obj.objection}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-200">{obj.counter}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <D2dCommissionCalculator />
        </div>

        <section className="mt-12 flex flex-wrap gap-2">
          {D2D_CITIES.slice(0, 10).map((city) => (
            <Link
              key={city.slug}
              href={`/gebietsplanung/${city.slug}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-zinc-300 hover:border-rose-500/40 hover:text-white"
            >
              {city.name} ({city.households.toLocaleString("de-DE")} HH)
            </Link>
          ))}
          {D2D_INDUSTRIES.filter((i) => i.slug !== industry.slug).map((item) => (
            <Link
              key={item.slug}
              href={`/d2d-vertrieb/${item.slug}`}
              className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20"
            >
              {item.name} →
            </Link>
          ))}
        </section>
      </main>

      <PseoFooterSection />
    </div>
  );
}
