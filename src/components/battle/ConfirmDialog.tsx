import { Loader2 } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { battleTexts } from "../../texts/battleTexts";
import { GLASS_BUTTON_INLINE } from "../glass/glassStyles";
import Modal from "../ui/Modal";

export type ConfirmTone = "red" | "amber" | "gray" | "orange";

/** Farbe von Symbol-Hof und Bestätigen-Knopf je Art der Abfrage. */
const TONES: Record<ConfirmTone, { halo: string; button: string }> = {
  red: { halo: "from-rose-400/30 to-red-500/10", button: "" },
  amber: { halo: "from-amber-300/35 to-amber-500/10", button: "from-amber-500 to-amber-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_24px_-10px_rgba(217,119,6,0.7)]" },
  gray: { halo: "from-slate-300/40 to-slate-500/10", button: "from-slate-600 to-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_-10px_rgba(51,65,85,0.7)]" },
  orange: { halo: "from-orange-300/35 to-red-500/10", button: "from-orange-500 to-red-600" },
};

const OUTLINE =
  "glass-surface flex h-12 flex-1 items-center justify-center rounded-2xl text-sm font-semibold text-foreground transition-[background-color,transform] hover:bg-[var(--glass-hover)] active:scale-[0.98]";

interface ConfirmDialogProps {
  open: boolean;
  emoji: string;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmIcon?: ReactNode;
  tone: ConfirmTone;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Sicherheitsabfrage der Arena (Krankmeldung, Stornieren, Serien zurücksetzen …) im Glas-Look. */
export default function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, emoji, title, children, confirmLabel, confirmIcon, tone, busy, onConfirm, onClose } = props;
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <div className="flex flex-col items-center px-6 pt-7 text-center">
        <span aria-hidden className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b text-[30px] ring-1 ring-inset ring-white/30", TONES[tone].halo)}>
          {emoji}
        </span>
        <h2 id={titleId} className="mt-4 text-[19px] font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{children}</p>
      </div>
      <div className="flex gap-2.5 p-6 pt-6">
        <button type="button" onClick={onClose} className={OUTLINE}>
          {battleTexts.cancel}
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={cn(GLASS_BUTTON_INLINE, "flex-1", TONES[tone].button)}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmIcon}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
