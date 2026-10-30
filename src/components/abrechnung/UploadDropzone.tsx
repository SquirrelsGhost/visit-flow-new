import { Loader2, Upload } from "lucide-react";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { cn } from "../../lib/cn";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";

interface UploadDropzoneProps {
  uploading: boolean;
  onFile: (file: File) => void;
}

/** Fläche für die Abrechnungsdatei: antippen oder (am Rechner) hineinziehen. */
export default function UploadDropzone({ uploading, onFile }: UploadDropzoneProps) {
  const [over, setOver] = useState(false);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // dieselbe Datei noch einmal wählen löst trotzdem aus
    if (file) onFile(file);
  };
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !uploading) onFile(file);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "group relative mt-4 flex cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-[border-color,background-color,transform] duration-300 active:scale-[0.99]",
        "focus-within:ring-4 focus-within:ring-emerald-500/15",
        over
          ? "border-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10"
          : "border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-neutral-800 dark:bg-white/[0.02] dark:hover:border-emerald-500/40",
        uploading && "pointer-events-none",
      )}
    >
      <input type="file" accept=".xlsx,.xls,.pdf" className="sr-only" onChange={onPick} disabled={uploading} />
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-card text-emerald-600 shadow-sm ring-1 ring-slate-200/70 transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-white/[0.06] dark:text-emerald-400 dark:ring-white/10">
        {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
      </span>
      <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{uploading ? t.comparing : t.dropFile}</span>
      <span className="text-xs text-slate-500 dark:text-neutral-400">{t.fileTypes}</span>
      {uploading && (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-emerald-100 dark:bg-emerald-500/10">
          <span className="block h-full w-1/3 animate-[abr-scan_1.2s_ease-in-out_infinite] rounded-full bg-emerald-500 motion-reduce:animate-none" />
        </span>
      )}
    </label>
  );
}
