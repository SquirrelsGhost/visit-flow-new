import { Save, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import GlassIcon from "@/components/glass/GlassIcon";
import { identWizardTexts } from "@/texts/identWizardTexts";
import IdentRailStep from "./IdentRailStep";

interface IdentRailProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: readonly { short: string; text: string }[];
  icons: readonly LucideIcon[];
  step: number;
  onSelectStep: (step: number) => void;
  /** Hinweis auf den Teil davor bzw. danach (Vertrag → Online-Ident). */
  journey?: ReactNode;
}

/** Linke Spalte ab iPad quer: Titel, rechtlicher Hinweis und alle Schritte als senkrechte Strecke. */
export default function IdentRail({ icon, eyebrow, title, subtitle, steps, icons, step, onSelectStep, journey }: IdentRailProps) {
  return (
    <div className="glass-deep flex w-full flex-col overflow-y-auto rounded-[24px] p-6">
      <GlassIcon icon={icon} tone="red" className="h-11 w-11" />
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{eyebrow}</p>
      <h2 className="mt-1.5 text-[19px] font-semibold leading-snug tracking-[-0.02em] text-white">{title}</h2>
      <p className="mt-2 text-[12.5px] leading-snug text-white/55">{subtitle}</p>
      <ol className="mt-8">
        {steps.map((s, i) => {
          const num = i + 1;
          const state = num < step ? "done" : num === step ? "active" : "todo";
          return <IdentRailStep key={s.short} icon={icons[i]} title={s.short} text={s.text} state={state} isLast={i === steps.length - 1} onSelect={() => onSelectStep(num)} />;
        })}
      </ol>
      {journey && <div className="mt-6">{journey}</div>}
      <p className="mt-auto flex items-center gap-2 pt-6 text-[11.5px] text-white/45">
        <Save className="h-3.5 w-3.5 text-emerald-300" />
        {identWizardTexts.autosave}
      </p>
    </div>
  );
}
