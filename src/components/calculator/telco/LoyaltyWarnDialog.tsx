import { useId } from "react";
import { pencilSellSecretTexts as t } from "../../../texts/pencilSellTexts";
import Modal from "../../ui/Modal";

interface LoyaltyWarnDialogProps {
  open: boolean;
  remaining: number;
  onClose: () => void;
}

/** Warnung beim 3. Tipp auf die Geheimfunktion (v1 AlertDialog). */
export default function LoyaltyWarnDialog({ open, remaining, onClose }: LoyaltyWarnDialogProps) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-sm border-amber-500/30 sm:max-w-lg">
      <div className="px-6 pt-6 text-center">
        <div className="mb-2 text-4xl">🤫</div>
        <h2 id={titleId} className="text-lg font-bold text-gray-900 dark:text-white">
          {t.warnTitle}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t.warnBody}
          {remaining > 0 && (
            <>
              <br />
              {t.warnRemaining(remaining)}
            </>
          )}
        </p>
      </div>
      <div className="flex flex-col-reverse gap-3 p-6 pt-5 sm:flex-row sm:justify-center">
        <button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-800">
          {t.cancel}
        </button>
        <button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-600 hover:to-amber-700 active:scale-[0.98]">
          {t.understood}
        </button>
      </div>
    </Modal>
  );
}
