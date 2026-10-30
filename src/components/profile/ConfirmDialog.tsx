import { useId, type ReactNode } from "react";
import Modal from "../ui/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}

const BUTTON = "h-11 flex-1 rounded-xl text-sm font-semibold transition-[filter,transform] duration-200 active:scale-[0.98] motion-reduce:transition-none disabled:opacity-60";

/** Kurze Rückfrage vor einer Änderung, die andere sehen (z. B. Anonymität im Leaderboard). */
export default function ConfirmDialog({ open, title, confirmLabel, cancelLabel, busy, onConfirm, onClose, children }: ConfirmDialogProps) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="glass-surface glass-blur bg-[var(--glass-fill-strong)] dark:bg-[var(--glass-fill-strong)] rounded-[28px] border-0">
      <div className="space-y-2 px-5 pb-4 pt-5">
        <h2 id={titleId} className="text-[17px] font-semibold text-foreground">
          {title}
        </h2>
        <div className="text-[14px] leading-relaxed text-muted-foreground">{children}</div>
      </div>
      <div className="flex gap-2 px-5 pb-5">
        <button type="button" onClick={onClose} className={`${BUTTON} bg-slate-100 text-foreground hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]`}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={`${BUTTON} bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:brightness-110`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
