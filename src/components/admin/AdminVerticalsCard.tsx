import type { Vertical } from "../../lib/battle/battleCategories";
import { cn } from "../../lib/cn";
import type { GlassTone } from "../../lib/glass/glassTones";
import { VERTICAL_OPTIONS } from "../../lib/navigation/verticals";
import { adminTexts } from "../../texts/adminTexts";
import GlassIcon from "../glass/GlassIcon";
import GlassNumber from "../glass/GlassNumber";
import GlassProgress from "../glass/GlassProgress";
import AdminPanel from "./AdminPanel";

interface AdminVerticalsCardProps {
  byVertical: Record<Vertical, number>;
  active: Vertical;
}

/** Farben wie der Sparten-Umschalter der Topbar. */
const TONE: Record<Vertical, GlassTone> = { telco: "blue", energy: "amber", solar: "green" };

/** Alle drei Sparten nebeneinander: Abschlüsse im Monat und ihr Anteil; die gewählte Sparte ist hervorgehoben. */
export default function AdminVerticalsCard({ byVertical, active }: AdminVerticalsCardProps) {
  const total = Math.max(1, VERTICAL_OPTIONS.reduce((sum, o) => sum + byVertical[o.id], 0));
  return (
    <AdminPanel label={adminTexts.verticals.label} footer={adminTexts.verticals.footer} className="space-y-1 p-2">
      {VERTICAL_OPTIONS.map((option) => {
        const value = byVertical[option.id];
        const selected = option.id === active;
        return (
          <div key={option.id} className={cn("flex items-center gap-3.5 rounded-[20px] px-2.5 py-2.5 transition-colors", selected && "bg-[var(--glass-hover)]")}>
            <GlassIcon icon={option.icon} tone={TONE[option.id]} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn("truncate text-[15px] font-semibold tracking-[-0.01em]", selected ? "text-foreground" : "text-slate-600 dark:text-white/70")}>{option.menuLabel}</span>
                <span className="shrink-0 text-[15px] font-semibold text-foreground">
                  <GlassNumber value={value} />
                </span>
              </div>
              <GlassProgress share={value / total} label={option.menuLabel} tone={TONE[option.id]} now={value} max={total} className="mt-2" />
            </div>
          </div>
        );
      })}
    </AdminPanel>
  );
}
