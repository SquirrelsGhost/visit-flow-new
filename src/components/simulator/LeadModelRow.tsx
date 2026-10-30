import { cn } from "../../lib/cn";
import { euroWhole } from "../../lib/simulator/simulatorFormat";
import { GLASS_TONES, type GlassTone } from "../../lib/glass/glassTones";
import { SETTINGS_TONES } from "../../lib/settings/settingsTones";
import { GLASS_ICON } from "../glass/glassStyles";
import type { LeadModel } from "../../texts/simulatorTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import { MONEY, PAD } from "./simulatorStyles";

interface LeadModelRowProps {
  index: number;
  model: LeadModel;
  tone: GlassTone;
  current: boolean;
}

/** Eine Stufe der Vergütungsübersicht (v1 Karten 01–04); die eigene Stufe ist hervorgehoben. */
export default function LeadModelRow({ index, model, tone, current }: LeadModelRowProps) {
  const colors = SETTINGS_TONES[tone];
  return (
    <div className={cn(PAD, "flex items-start gap-3 transition-colors duration-300", current && "bg-[var(--glass-hover)]")}>
      <span aria-hidden className={cn(GLASS_ICON, GLASS_TONES[tone].icon, "text-[12px] font-bold")}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-[14px] font-semibold text-foreground">{model.title}</span>
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", colors.icon)}>{model.badge}</span>
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-slate-600 dark:text-slate-300">{model.text}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">{model.note}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className={cn("block text-[17px] font-bold", MONEY, colors.text)}>{euroWhole(model.rate)}</span>
        <span className="block text-[9.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.lead.from100}</span>
      </span>
    </div>
  );
}
