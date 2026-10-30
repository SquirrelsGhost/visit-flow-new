import { AlertTriangle } from "lucide-react";
import { useLastDefined } from "../../hooks/useLastDefined";
import { cn } from "../../lib/cn";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import Modal from "../ui/Modal";
import { OUTLINE_BUTTON } from "./abrechnungStyles";

export type DeleteTarget = { kind: "record"; label: string } | { kind: "items"; count: number };

interface DeleteDialogProps {
  target: DeleteTarget | null;
  onClose: () => void;
  onConfirm: (target: DeleteTarget) => void;
}

/** Sicherheitsabfrage vor dem Löschen: ganzer Monat oder die gewählten Positionen (v1). */
export default function DeleteDialog({ target, onClose, onConfirm }: DeleteDialogProps) {
  const shown = useLastDefined(target);
  return (
    <Modal open={!!target} onClose={onClose} labelledBy="abr-delete-title" className="max-w-md">
      {shown && (
        <div className="p-5">
          <h2 id="abr-delete-title" className="flex items-center gap-2 text-lg font-semibold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            {shown.kind === "record" ? t.deleteRecordTitle : t.deleteItemsTitle(shown.count)}
          </h2>
          <p className="mt-2 text-sm text-pretty text-slate-500 dark:text-neutral-400">
            {shown.kind === "record" ? t.deleteRecordBody(shown.label) : t.deleteItemsBody}
          </p>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={onClose} className={cn(OUTLINE_BUTTON, "flex-1")}>
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(shown)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-rose-600 text-sm font-semibold text-white transition-colors hover:bg-rose-700 active:scale-[0.98]"
            >
              {shown.kind === "record" ? t.delete : t.remove}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
