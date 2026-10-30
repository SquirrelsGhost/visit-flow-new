import { CheckCircle2, Download, FileText, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { contractWizardTexts } from "@/texts/contractWizardTexts";

interface ContractPdfCardProps {
  locked: boolean;
  downloaded: boolean;
  onDownload: () => Promise<void>;
}

const ACTION = "no-touch-target-fix inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-[background-color,transform,opacity] duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50";

/** Persönliches Vertrags-PDF als Dokumentkarte: gesperrt ohne Anschrift, dann Laden, danach mit Häkchen. */
export default function ContractPdfCard({ locked, downloaded, onDownload }: ContractPdfCardProps) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    try {
      await onDownload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("glass-surface flex items-center gap-3.5 rounded-[22px] p-4 transition-shadow duration-500", downloaded && "ring-1 ring-inset ring-emerald-500/40")}>
      <span className={cn("relative flex h-14 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b text-white shadow-[0_8px_18px_-8px]", downloaded ? "from-emerald-400 to-emerald-600 shadow-emerald-600/70" : "from-rose-500 to-red-600 shadow-red-600/70")}>
        <FileText className="h-5 w-5" />
        <span className="absolute bottom-1 text-[8px] font-bold tracking-wider">PDF</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold leading-tight text-foreground">{contractWizardTexts.pdfTitle}</span>
        <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{contractWizardTexts.pdfFile}</span>
        <span className={cn("mt-1 flex items-center gap-1 text-[12px] font-medium", downloaded ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--glass-label)]")}>
          {downloaded ? <CheckCircle2 className="h-3.5 w-3.5" /> : locked ? <Lock className="h-3.5 w-3.5" /> : null}
          {downloaded ? contractWizardTexts.pdfDone : locked ? contractWizardTexts.pdfLocked : contractWizardTexts.pdfMeta}
        </span>
      </span>
      <button type="button" disabled={locked || busy} onClick={() => void handle()} aria-label={downloaded ? contractWizardTexts.pdfAgain : contractWizardTexts.pdfAria} className={cn(ACTION, downloaded ? "bg-[var(--glass-track)] text-foreground hover:bg-[var(--glass-hover)]" : "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_8px_18px_-8px_rgba(220,38,38,0.8)]")}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        <span className="hidden sm:inline">{busy ? contractWizardTexts.pdfBusy : downloaded ? contractWizardTexts.pdfAgain : contractWizardTexts.pdfAction}</span>
      </button>
    </div>
  );
}
