import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ICON_TILE } from "./battleStyles";

interface PanelHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  trailing?: ReactNode;
  className?: string;
}

/** Kopf einer Verwaltungs-Karte: rote Symbol-Kachel, Titel, ruhige Unterzeile und optional etwas rechts. */
export default function PanelHeader({ icon: Icon, title, subtitle, trailing, className }: PanelHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <span
        className={cn(
          ICON_TILE,
          "h-11 w-11 bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-[0_8px_20px_-8px_rgba(220,38,38,0.65)] ring-white/25",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[17px] leading-tight font-semibold tracking-tight text-slate-900 dark:text-white">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-slate-500 dark:text-neutral-400">{subtitle}</span>
      </span>
      {trailing}
    </div>
  );
}
