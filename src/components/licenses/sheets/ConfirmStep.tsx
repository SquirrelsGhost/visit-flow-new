import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import SheetButton from "./SheetButton";

interface ConfirmStepProps {
  /** Knopf vor der Rückfrage (z. B. "Lizenz entziehen"). */
  label: string;
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  busy: boolean;
  onConfirm: () => void;
}

/** Folgenreiche Aktion in zwei Schritten direkt im Sheet: erst der Warnknopf, dann Rückfrage mit Bestätigen. */
export default function ConfirmStep({ label, question, confirmLabel, cancelLabel, busy, onConfirm }: ConfirmStepProps) {
  const [asking, setAsking] = useState(false);
  return (
    <AnimatePresence mode="wait" initial={false}>
      {asking ? (
        <motion.div key="ask" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 rounded-[22px] bg-red-500/[0.07] p-4">
          <p role="alert" className="text-[13.5px] leading-snug text-red-700 dark:text-red-300">
            {question}
          </p>
          <div className="flex gap-2">
            <SheetButton variant="secondary" label={cancelLabel} onClick={() => setAsking(false)} disabled={busy} />
            <SheetButton variant="danger" label={confirmLabel} busy={busy} onClick={onConfirm} />
          </div>
        </motion.div>
      ) : (
        <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SheetButton variant="danger" label={label} onClick={() => setAsking(true)} disabled={busy} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
