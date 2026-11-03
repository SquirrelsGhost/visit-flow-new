import Link from "next/link";
import CompassMark from "@/components/website/ui/CompassMark";

export interface PseoHeaderNavProps {
  activeSection?: "calculator" | "industries" | "cities";
}

const NAV_ITEMS = [
  { key: "calculator", href: "/rechner/d2d-provisionsabrechnung", label: "Provisions-Rechner" },
  { key: "industries", href: "/d2d-vertrieb", label: "D2D-Branchen" },
  { key: "cities", href: "/gebietsplanung", label: "Gebiets-Atlas (DACH)" },
  { key: "blog", href: "/blog", label: "Praxis-Ratgeber" },
] as const;

export default function PseoHeaderNav({ activeSection }: PseoHeaderNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090d]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-white transition hover:opacity-90">
          <CompassMark size={32} />
          <span className="text-lg font-bold tracking-tight">Visit Flow</span>
          <span className="hidden rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-300 sm:inline-block">
            D2D OS
          </span>
        </Link>

        <nav aria-label="SEO Navigation" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/5 sm:text-sm"
          >
            Login
          </Link>
          <Link
            href="/onboarding"
            className="rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/25 transition hover:from-rose-500 hover:to-red-400 sm:text-sm"
          >
            Team starten
          </Link>
        </div>
      </div>
    </header>
  );
}
