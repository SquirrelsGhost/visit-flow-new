import { Check, FileText, Loader2, X } from "lucide-react";
import { useState } from "react";
import { parseAmount } from "../../lib/abrechnung/abrechnungFormat";
import { cn } from "../../lib/cn";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { FIELD, ICON_BUTTON, INSET, OUTLINE_BUTTON, PRIMARY_BUTTON } from "./abrechnungStyles";

interface TotalFormProps {
  file: File | null;
  uploading: boolean;
  onSubmit: (total: number) => void;
  onBack: () => void;
}

/** PDF oder gar keine Datei: dann trägt man die Summe der Abrechnung ein (v1). */
export default function TotalForm({ file, uploading, onSubmit, onBack }: TotalFormProps) {
  const [amount, setAmount] = useState("");
  const value = parseAmount(amount);
  const ok = Number.isFinite(value);
  const invalid = amount !== "" && !ok;
  const submit = () => ok && !uploading && onSubmit(value);

  return (
    <div className="mt-4 space-y-3">
      {file && (
        <div className={cn(INSET, "flex items-center gap-3 py-1 pr-1 pl-3")}>
          <FileText className="h-5 w-5 shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-neutral-100">{file.name}</span>
          <button type="button" onClick={onBack} className={ICON_BUTTON} aria-label={t.otherFile}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div>
        <label htmlFor="abrechnung-summe" className="text-sm font-medium text-slate-800 dark:text-neutral-100">
          {t.totalLabel}
        </label>
        <div className="relative mt-1.5">
          <input
            id="abrechnung-summe"
            inputMode="decimal"
            autoComplete="off"
            autoFocus
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-invalid={invalid}
            className={cn(FIELD, "h-12 pr-10 text-right text-lg font-semibold tabular-nums", invalid && "border-rose-400 focus:border-rose-400 focus:ring-rose-500/10")}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">€</span>
        </div>
        <p className={cn("mt-1.5 text-xs text-pretty", invalid ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-neutral-400")}>
          {invalid ? t.totalInvalid : file ? t.pdfHint : t.totalHint}
        </p>
      </div>
      <div className="flex gap-2">
        {!file && (
          <button type="button" onClick={onBack} className={cn(OUTLINE_BUTTON, "h-12 px-5")}>
            {t.back}
          </button>
        )}
        <button type="button" onClick={submit} disabled={!ok || uploading} className={cn(PRIMARY_BUTTON, "h-12 flex-1")}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {t.compare}
        </button>
      </div>
    </div>
  );
}
