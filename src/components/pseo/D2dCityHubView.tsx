import Link from "next/link";
import PseoFooterSection from "@/components/pseo/PseoFooterSection";
import PseoHeaderNav from "@/components/pseo/PseoHeaderNav";
import { D2D_CITIES } from "@/lib/pseo/visitFlowCitiesData";

export interface D2dCityHubViewProps {
  readonly _?: never;
}

export default function D2dCityHubView(_props: D2dCityHubViewProps) {
  const totalHouseholds = D2D_CITIES.reduce((acc, c) => acc + c.households, 0);

  return (
    <div className="min-h-screen bg-[#07070b] text-zinc-100">
      <PseoHeaderNav activeSection="cities" />

      <main className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase">
            Vertriebsgebiete optimieren · DACH Gebiets-Atlas 2026
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            D2D-Gebietsplanung & Haushalts-Potenziale nach Stadt
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
            Über {totalHouseholds.toLocaleString("de-DE")} Haushalte in 20 DACH-Metropolen:
            Vergleiche Mehrfamilienhaus-Quoten, FTTH-Glasfaser-Ausbaucluster, Solar-Dachpotenziale
            und optimale Teamgrößen für deine Gebietsoptimierung.
          </p>
        </div>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {D2D_CITIES.map((city) => (
            <article
              key={city.slug}
              className="flex flex-col justify-between rounded-3xl border border-white/10 bg-zinc-900/60 p-6 transition hover:border-rose-500/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                    {city.country} · {city.state}
                  </span>
                  <span className="text-xs font-medium text-rose-300">
                    Ø {city.avgDoorsPerHour} Türen/Std.
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  D2D-Gebietsplanung {city.name}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400 line-clamp-3">
                  {city.localInsight}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/30 p-3 text-center">
                  <div>
                    <p className="text-[10px] text-zinc-400">Haushalte</p>
                    <p className="mt-0.5 text-xs font-bold text-white">
                      {city.households.toLocaleString("de-DE")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">MFH-Anteil</p>
                    <p className="mt-0.5 text-xs font-bold text-emerald-300">
                      {city.multiFamilySharePct} %
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">EFH-Anteil</p>
                    <p className="mt-0.5 text-xs font-bold text-amber-300">
                      {city.singleFamilySharePct} %
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <Link
                  href={`/gebietsplanung/${city.slug}`}
                  className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                >
                  Gebiets-Analyse {city.name} →
                </Link>
                <span className="text-[11px] text-zinc-400">{city.recommendedTeamSize}</span>
              </div>
            </article>
          ))}
        </section>
      </main>

      <PseoFooterSection />
    </div>
  );
}
