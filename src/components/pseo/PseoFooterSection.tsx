import Link from "next/link";
import { D2D_CITIES } from "@/lib/pseo/visitFlowCitiesData";
import { D2D_INDUSTRIES } from "@/lib/pseo/visitFlowPseoData";

export interface PseoFooterSectionProps {
  readonly _?: never;
}

export default function PseoFooterSection(_props: PseoFooterSectionProps) {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#07070b] py-14 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-base font-bold text-white">Visit Flow</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Das führende Betriebssystem für Door-to-Door-Vertriebsteams in DACH:
              Gebietsplanung, Lauflisten, Echtzeit-Provisionsabrechnung & KI-Coach.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/onboarding"
                className="rounded-full bg-rose-600/20 px-3 py-1 text-xs font-medium text-rose-300 hover:bg-rose-600/30"
              >
                Team-Zugang buchen →
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
              >
                Berater-Login
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              Tools & Rechner
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/rechner/d2d-provisionsabrechnung" className="hover:text-white">
                  D2D-Provisions- & Storno-Rechner
                </Link>
              </li>
              <li>
                <Link href="/gebietsplanung" className="hover:text-white">
                  DACH Gebiets- & Haushalts-Atlas
                </Link>
              </li>
              <li>
                <Link href="/d2d-vertrieb" className="hover:text-white">
                  Branchen-Lösungen im Vergleich
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white">
                  D2D-Leitfäden & Praxis-Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              D2D nach Branche
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              {D2D_INDUSTRIES.map((ind) => (
                <li key={ind.slug}>
                  <Link href={`/d2d-vertrieb/${ind.slug}`} className="hover:text-white">
                    {ind.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              Top-Städte Gebietsplanung
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              {D2D_CITIES.slice(0, 14).map((city) => (
                <Link
                  key={city.slug}
                  href={`/gebietsplanung/${city.slug}`}
                  className="rounded border border-white/10 bg-white/[0.02] px-2 py-0.5 text-zinc-300 hover:border-rose-500/40 hover:text-white"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© 2026 Visit Flow · Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-zinc-300">Startseite</Link>
            <Link href="/blog" className="hover:text-zinc-300">Blog</Link>
            <Link href="/sitemap.xml" className="hover:text-zinc-300">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
