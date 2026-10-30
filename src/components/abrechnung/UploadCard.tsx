import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { isBillingFile, isExcelName, MAX_FILE_BYTES } from "../../lib/abrechnung/abrechnungFormat";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import FadeSwap from "../ui/FadeSwap";
import { CARD, CARD_TITLE, ICON_BUTTON } from "./abrechnungStyles";
import TotalForm from "./TotalForm";
import UploadDropzone from "./UploadDropzone";

interface UploadCardProps {
  monthName: string;
  salesDative: string;
  replacing: boolean;
  uploading: boolean;
  onUpload: (file: File | null, total?: number) => Promise<boolean>;
  onCancelReplace: () => void;
}

/** Abrechnung hochladen (v1): Excel wird sofort abgeglichen, PDF oder ohne Datei braucht die Summe. */
export default function UploadCard({ monthName, salesDative, replacing, uploading, onUpload, onCancelReplace }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [manual, setManual] = useState(false);
  const reset = () => {
    setFile(null);
    setManual(false);
  };

  const onFile = (f: File) => {
    if (!isBillingFile(f.name)) return void toast.error(t.wrongType);
    if (f.size > MAX_FILE_BYTES) return void toast.error(t.tooBig);
    if (isExcelName(f.name)) void onUpload(f);
    else {
      setFile(f);
      setManual(false);
    }
  };
  const submitTotal = async (total: number) => {
    if (await onUpload(file, total)) reset();
  };

  const needsTotal = !!file || manual;
  return (
    <motion.section variants={riseIn} className={cn(CARD, "p-5")}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-300/25 via-lime-200/10 to-transparent blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className={CARD_TITLE}>{t.uploadTitle(replacing, monthName)}</h2>
          <p className="mt-1 text-sm text-pretty text-slate-500 dark:text-neutral-400">{t.uploadHint(salesDative)}</p>
        </div>
        {replacing && (
          <button type="button" onClick={onCancelReplace} className={cn(ICON_BUTTON, "-mt-2 -mr-2")} aria-label={t.cancel}>
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="relative">
        {needsTotal ? (
          <FadeSwap key="total">
            <TotalForm file={file} uploading={uploading} onSubmit={submitTotal} onBack={reset} />
          </FadeSwap>
        ) : (
          <FadeSwap key="drop">
            <UploadDropzone uploading={uploading} onFile={onFile} />
            {!uploading && (
              <button type="button" onClick={() => setManual(true)} className="mt-2 w-full rounded-lg py-2 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white">
                {t.noFileQuestion} <span className="font-medium underline underline-offset-4">{t.onlyTotal}</span>
              </button>
            )}
          </FadeSwap>
        )}
      </div>
    </motion.section>
  );
}
