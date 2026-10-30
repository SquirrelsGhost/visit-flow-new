import { Check, Loader2, Swords, X } from "lucide-react";
import type { Challenge } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import ArenaSection from "./ArenaSection";
import { ARENA_CARD, AVATAR, PILL_BUTTON, ROUND_GLASS_BUTTON, initial } from "./battleStyles";
import SectionTitle from "./SectionTitle";

interface PendingChallengesProps {
  challenges: Challenge[];
  isBusy: (id: string) => boolean;
  onRespond: (id: string, action: "accept" | "decline") => void;
}

/** Herausforderungen an mich: goldener, atmender Schein, damit man sie nicht übersieht; Ablehnen und Annehmen direkt in der Zeile. */
export default function PendingChallenges({ challenges, isBusy, onRespond }: PendingChallengesProps) {
  if (challenges.length === 0) return null;
  return (
    <ArenaSection title={<SectionTitle count={challenges.length}>{t.pendingTitle}</SectionTitle>}>
      <div className="space-y-2.5">
        {challenges.map((c) => {
          const busy = isBusy(c.id);
          return (
            <div key={c.id} className={cn(ARENA_CARD, "arena-challenge-glow p-4")}>
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(90%_120%_at_0%_0%,rgba(245,158,11,0.16),transparent_60%)]" />
              <div className="relative flex items-center gap-3.5">
                <span className="relative">
                  <span className={AVATAR}>{initial(c.challengerName)}</span>
                  <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 ring-2 ring-[var(--glass-fill-strong)]">
                    <Swords aria-hidden className="h-3 w-3" />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-semibold text-foreground">{c.challengerName}</span>
                  <span className="block text-[13px] text-amber-700 dark:text-amber-300">{t.challengesYou}</span>
                </span>
              </div>
              <div className="relative mt-3.5 flex gap-2">
                <button type="button" disabled={busy} onClick={() => onRespond(c.id, "decline")} className={cn(ROUND_GLASS_BUTTON, "h-11 flex-1 gap-1.5 rounded-2xl text-[13.5px] font-semibold")}>
                  <X className="h-4 w-4" />
                  {t.decline}
                </button>
                <button type="button" disabled={busy} onClick={() => onRespond(c.id, "accept")} className={cn(PILL_BUTTON, "h-11 flex-[1.4] rounded-2xl text-[14px]")}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {t.accept}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ArenaSection>
  );
}
