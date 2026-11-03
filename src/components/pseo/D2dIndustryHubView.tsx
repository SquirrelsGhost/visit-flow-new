import Link from "next/link";
import PseoFooterSection from "@/components/pseo/PseoFooterSection";
import PseoHeaderNav from "@/components/pseo/PseoHeaderNav";
import { D2D_INDUSTRIES } from "@/lib/pseo/visitFlowPseoData";

export interface D2dIndustryHubViewProps {
  readonly _?: never;
}

export default function D2dIndustryHubView(_props: D2dIndustryHubViewProps) {
  return (
    <div className="min-h-screen bg-[#07070b] text-zinc-100">
      <PseoHeaderNav activeSection="industries" />

      <main className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase">
            D2D Software · Branchen-Spezialisierungen
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Das D2D-Betriebssystem für deine Vertriebsbranche
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
            Ob FTTH-Vorvermarktungsquote von 40 %, Solar-Dachqualifizierung im Setter-Closer-Modell
            oder Tarifwechsel mit Vertragsablauf-Radar: Visit Flow bildet die echten Workflows
            deiner Sparte bis ins Detail ab.
          </p>
        </div>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {D2D_INDUSTRIES.map((ind) => (
            <article
              key={ind.slug}
              className="flex flex-col justify-between rounded-3xl border border-white/10 bg-zinc-900/60 p-6 transition hover:border-rose-500/40 sm:p-8"
            >
              <div>
                <span className="inline-block rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
                  {ind.badge}
                </span>
                <h2 className="mt-4 text-2xl font-bold text-white">{ind.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{ind.heroSubtitle}</p>

                <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-black/30 p-3.5">
                  <div>
                    <p className="text-[11px] text-zinc-400">Ø Provision</p>
                    <p className="mt-0.5 text-sm font-bold text-white">{ind.avgCommissionEur}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-400">Ø Quote / Output</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-300">{ind.avgConversionRate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-400">Visit Flow Effekt</p>
                    <p className="mt-0.5 text-sm font-bold text-rose-300">{ind.stornoReduction}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <Link
                  href={`/d2d-vertrieb/${ind.slug}`}
                  className="text-sm font-semibold text-rose-300 hover:text-rose-200"
                >
                  Branchen-Lösung & Leitfaden öffnen →
                </Link>
                <Link
                  href="/onboarding"
                  className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                >
                  Team starten
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>

      <PseoFooterSection />
    </div>
  );
}
