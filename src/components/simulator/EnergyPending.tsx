import { Zap } from "lucide-react";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import GlassIcon from "../glass/GlassIcon";
import SettingsGroup from "../settings/SettingsGroup";
import { PAD } from "./simulatorStyles";

/** Platzhalter für Energie, solange es keine echte Provision gibt (wie der Hinweis in der v1-Abrechnung). */
export interface EnergyPendingProps { readonly _?: never; }

export default function EnergyPending() {
  return (
    <SettingsGroup>
      <div role="status" className={`${PAD} flex items-start gap-3`}>
        <GlassIcon icon={Zap} tone="amber" />
        <div className="min-w-0 space-y-1">
          <p className="text-[15px] font-semibold text-slate-900 dark:text-white">{t.energyPending.title}</p>
          <p className="text-sm leading-relaxed text-[var(--glass-label)]">{t.energyPending.body}</p>
        </div>
      </div>
    </SettingsGroup>
  );
}
