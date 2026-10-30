import { Check, Loader2, X } from "lucide-react";
import { useId } from "react";
import type { Challenge } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import { GLASS_BUTTON_INLINE } from "../glass/glassStyles";
import Modal from "../ui/Modal";
import DuelAvatar from "./DuelAvatar";

interface IncomingChallengeDialogProps {
  challenge: Challenge | null;
  busy: boolean;
  onRespond: (id: string, action: "accept" | "decline") => void;
  onClose: () => void;
}

const DECLINE =
  "glass-surface inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl text-sm font-semibold text-slate-600 transition-[background-color,transform] hover:bg-[var(--glass-hover)] active:scale-[0.98] disabled:opacity-60 dark:text-white/70";

/** Popup "Herausforderung!", wenn dich jemand gerade herausfordert: tiefer Kopf mit beiden Seiten im Duell. */
export default function IncomingChallengeDialog({ challenge, busy, onRespond, onClose }: IncomingChallengeDialogProps) {
  const titleId = useId();
  return (
    <Modal open={challenge !== null} onClose={onClose} labelledBy={titleId}>
      {challenge && (
        <>
          <div className="glass-deep rounded-none px-6 pb-6 pt-7 text-center">
            <span aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(239,68,68,0.5),transparent)]" />
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.45),transparent)]" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">{t.incomingTitle}</p>
            <div className="relative mt-4 flex items-center justify-center gap-4">
              <DuelAvatar name={challenge.challengerName} side="left" leads={false} size="lg" />
              <span className="text-[22px] font-semibold italic tracking-tight text-white/80">{t.vs.toUpperCase()}</span>
              <DuelAvatar name={challenge.opponentName} side="right" leads={false} size="lg" />
            </div>
            <h3 id={titleId} className="relative mt-4 text-[19px] font-semibold tracking-[-0.02em] text-white">
              {challenge.challengerName}
            </h3>
            <p className="relative mt-0.5 text-[13.5px] text-white/60">{t.incomingBody}</p>
          </div>
          <div className="flex gap-2.5 p-5">
            <button type="button" disabled={busy} onClick={() => onRespond(challenge.id, "decline")} className={DECLINE}>
              <X className="h-4 w-4" /> {t.decline}
            </button>
            <button type="button" disabled={busy} onClick={() => onRespond(challenge.id, "accept")} className={cn(GLASS_BUTTON_INLINE, "flex-1")}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {t.acceptLoud}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
