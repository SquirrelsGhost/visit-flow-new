import { Check, Download, FileText, Fingerprint, MapPin, MonitorSmartphone, PenLine } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GLASS_DIVIDER } from "@/components/glass/glassStyles";
import IdentSummaryRow from "@/components/security/ident/IdentSummaryRow";
import { cn } from "@/lib/cn";
import type { SecurityAcceptanceRecord } from "@/lib/security/securityContractStore";
import { contractWizardTexts } from "@/texts/contractWizardTexts";

interface ContractDoneProps {
  record: SecurityAcceptanceRecord | null;
  /** Führungskraft ohne Online-Ident: Hinweis auf Teil 2 und automatischer Übergang. */
  needsIdent: boolean;
  onContinue: () => void;
  onDownload: () => Promise<void>;
  onReview: () => void;
}

const AUTO_MS = 6000;
const LINK = "no-touch-target-fix inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-600 hover:underline dark:text-red-400";

/** Abschluss: Siegel, Beleg der Unterschrift, Download und für Führungskräfte der nahtlose Übergang zum Online-Ident. */
export default function ContractDone({ record, needsIdent, onContinue, onDownload, onReview }: ContractDoneProps) {
  const [auto, setAuto] = useState(needsIdent);
  const signedAt = record ? new Date(record.acceptedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }) : "";

  const continueRef = useRef(onContinue);
  useEffect(() => {
    continueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => continueRef.current(), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [auto]);

  const download = () => {
    setAuto(false);
    void onDownload();
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 [animation-duration:2.6s] [animation-iteration-count:2] motion-reduce:hidden" />
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 text-white shadow-[0_14px_34px_-10px_rgba(16,185,129,0.85)]">
          <Check className="h-10 w-10" strokeWidth={2.6} />
        </span>
      </motion.div>

      {needsIdent && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-deep overflow-hidden rounded-[24px] p-5">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_8px_22px_-6px_rgba(220,38,38,0.8)]">
              <Fingerprint className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white">{contractWizardTexts.done.nextTitle}</p>
              <p className="mt-1 text-[13px] leading-snug text-white/65">{contractWizardTexts.done.nextText}</p>
            </div>
          </div>
          {auto && (
            <div className="mt-4">
              <span className="block h-1 overflow-hidden rounded-full bg-white/10">
                <motion.span className="block h-full origin-left rounded-full bg-gradient-to-r from-rose-400 to-red-500" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: AUTO_MS / 1000, ease: "linear" }} />
              </span>
              <p className="mt-2 text-[11.5px] text-white/50">{contractWizardTexts.done.autoNext}</p>
            </div>
          )}
        </motion.div>
      )}
      {record && (
        <div className={cn("glass-surface overflow-hidden rounded-[22px]", GLASS_DIVIDER, "[&>*+*]:before:left-[3.75rem]")}>
          <IdentSummaryRow icon={PenLine} tone="green" label={contractWizardTexts.done.rowSigned} value={signedAt} detail={contractWizardTexts.version} />
          <IdentSummaryRow icon={MapPin} tone="orange" label={contractWizardTexts.done.rowAddress} value={record.address} />
          <IdentSummaryRow icon={MonitorSmartphone} tone="indigo" label={contractWizardTexts.done.rowDevice} value={record.fingerprint} mono />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <button type="button" onClick={download} className={LINK}>
          <Download className="h-4 w-4" /> {contractWizardTexts.done.download}
        </button>
        <button type="button" onClick={onReview} className={LINK}>
          <FileText className="h-4 w-4" /> {contractWizardTexts.done.review}
        </button>
      </div>

    </div>
  );
}
