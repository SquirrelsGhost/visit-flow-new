import { Check, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadDataUrlFile } from "@/lib/security/kycVault";
import { identWizardTexts } from "@/texts/identWizardTexts";
import IdentCardPlaceholder from "./IdentCardPlaceholder";

interface IdentCaptureTileProps {
  side: "front" | "back";
  title: string;
  confirmLabel: string;
  fileName: string;
  verified: boolean;
  dataUrl: string | null;
  /** Diese Seite ist gerade in der Kamera dran. */
  active: boolean;
  onToggle: () => void;
  onRescan: () => void;
}

const ICON_BUTTON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:bg-[var(--glass-hover)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";

/** Eine erfasste Ausweisseite: Vorschaubild, Bestätigung der Prüfung, neu scannen und Kopie sichern. */
export default function IdentCaptureTile({ side, title, confirmLabel, fileName, verified, dataUrl, active, onToggle, onRescan }: IdentCaptureTileProps) {
  return (
    <div className={cn("relative flex items-start gap-3.5 px-3.5 py-3.5", active && "bg-red-500/[0.05]")}>
      <div className={cn("relative aspect-[1.586] w-[5.5rem] shrink-0 overflow-hidden rounded-xl bg-[var(--glass-track)] ring-1 ring-inset", verified ? "ring-emerald-500/50" : active ? "ring-red-500/50" : "ring-[var(--glass-divider)]")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Vorschau aus lokalem data:-URL */}
        {dataUrl ? <img src={dataUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <IdentCardPlaceholder side={side} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13.5px] font-semibold text-foreground">{title}</p>
          <div className="-my-1.5 -mr-1.5 flex">
            {dataUrl && (
              <button type="button" onClick={() => downloadDataUrlFile(dataUrl, fileName)} aria-label={identWizardTexts.scanSaveCopy} title={identWizardTexts.scanSaveCopy} className={ICON_BUTTON}>
                <Download className="h-4 w-4" />
              </button>
            )}
            {dataUrl && !active && (
              <button type="button" onClick={onRescan} aria-label={`${title}: ${identWizardTexts.scanLive.rescan}`} title={identWizardTexts.scanLive.rescan} className={ICON_BUTTON}>
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <button type="button" aria-pressed={verified} onClick={onToggle} className="mt-1.5 flex w-full items-start gap-2.5 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40">
          <span className={cn("mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md transition-[background-color,box-shadow] duration-300", verified ? "bg-emerald-500 text-white" : "ring-[1.5px] ring-inset ring-slate-300 dark:ring-white/25")}>
            {verified && <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
          <span className={cn("text-[12px] leading-snug", verified ? "text-foreground/85" : "text-muted-foreground")}>{confirmLabel}</span>
        </button>
      </div>
    </div>
  );
}
