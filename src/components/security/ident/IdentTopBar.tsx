import { X, type LucideIcon } from "lucide-react";
import GlassIcon from "@/components/glass/GlassIcon";
import { GLASS_ICON_BUTTON } from "@/components/glass/glassStyles";
import { identWizardTexts } from "@/texts/identWizardTexts";

interface IdentTopBarProps {
  icon: LucideIcon;
  eyebrow: string;
  /** Zweite Zeile, z. B. "Schritt 2 von 4". */
  progressText: string;
  /** Fehlt, solange der Ablauf Pflicht ist und nicht abgebrochen werden darf. */
  onClose?: () => void;
}

/** Kopfzeile eines geführten Ablaufs: Griff (Handy), Plakette, Verfahren und Schrittzähler, Schließen-Knopf. */
export default function IdentTopBar({ icon, eyebrow, progressText, onClose }: IdentTopBarProps) {
  return (
    <div className="shrink-0">
      <div className="flex justify-center pb-1 pt-3 md:hidden">
        <span aria-hidden className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-white/20" />
      </div>
      <div className="flex min-h-9 items-center gap-3 px-5 pt-2 md:pt-5 lg:px-8 lg:pt-6">
        <GlassIcon icon={icon} tone="red" className="lg:hidden" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{eyebrow}</p>
          <p className="mt-0.5 text-[13px] font-medium text-foreground">{progressText}</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={identWizardTexts.close} className={GLASS_ICON_BUTTON}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
