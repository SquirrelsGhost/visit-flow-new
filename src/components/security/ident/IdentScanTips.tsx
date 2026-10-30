import { Scan, SunMedium, Move } from "lucide-react";
import { identWizardTexts } from "@/texts/identWizardTexts";

const ICONS = [Move, Scan, SunMedium] as const;

/** Drei kurze Hinweise zur Haltung des Ausweises unter der Kamera. */
export interface IdentScanTipsProps { readonly _?: never; }

export default function IdentScanTips() {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {identWizardTexts.scanLive.tips.map((tip, i) => {
        const Icon = ICONS[i];
        return (
          <li key={tip} className="flex flex-col items-center gap-1.5 rounded-2xl bg-[var(--glass-track)]/70 px-2 py-2.5 text-center ring-1 ring-inset ring-[var(--glass-divider)]">
            <Icon className="h-4 w-4 text-red-500" />
            <span className="text-[11px] font-medium leading-tight text-muted-foreground">{tip}</span>
          </li>
        );
      })}
    </ul>
  );
}
