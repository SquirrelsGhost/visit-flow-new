import type { LucideIcon } from "lucide-react";
import { GLASS_ICON } from "@/components/glass/glassStyles";
import { cn } from "@/lib/cn";
import { GLASS_TONES, type GlassTone } from "@/lib/glass/glassTones";
import { identWizardTexts } from "@/texts/identWizardTexts";

interface IdentSummaryRowProps {
  icon: LucideIcon;
  tone: GlassTone;
  label: string;
  value: string;
  detail?: string;
  mono?: boolean;
  onEdit?: () => void;
}

/** Zeile der Zusammenfassung mit Plakette, Wert und optionalem Sprung zurück zum Schritt. */
export default function IdentSummaryRow({ icon: Icon, tone, label, value, detail, mono, onEdit }: IdentSummaryRowProps) {
  return (
    <div className="relative flex items-start gap-3.5 px-4 py-3.5">
      <span aria-hidden className={cn(GLASS_ICON, GLASS_TONES[tone].icon, "h-8 w-8")}>
        <Icon className="h-4 w-4" strokeWidth={2.3} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-medium text-[var(--glass-label)]">{label}</p>
        <p className={cn("mt-0.5 break-words text-[14px] font-semibold leading-snug text-foreground", mono && "font-mono text-[13px]")}>{value}</p>
        {detail && <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{detail}</p>}
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="shrink-0 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
          {identWizardTexts.summaryEdit}
        </button>
      )}
    </div>
  );
}
