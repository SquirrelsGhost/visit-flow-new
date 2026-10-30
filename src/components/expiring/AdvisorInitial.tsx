import { cn } from "../../lib/cn";

interface AdvisorInitialProps {
  name: string;
  active?: boolean;
}

/** Kleiner Anfangsbuchstabe als runde Plakette für Berater in Listen und Karten. */
export default function AdvisorInitial({ name, active = false }: AdvisorInitialProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold ring-1 ring-inset transition-colors duration-200",
        active ? "bg-gradient-to-br from-rose-400 to-red-600 text-white ring-white/25" : "bg-slate-900/[0.06] text-slate-600 ring-slate-900/[0.06] dark:bg-white/[0.08] dark:text-white/80 dark:ring-white/10",
      )}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </span>
  );
}
