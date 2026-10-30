// Zwei Auswahlfelder mit eigenem State
"use client";

import { Loader2, Swords } from "lucide-react";
import { useState } from "react";
import { playerGroups } from "../../../lib/battle/battleSelectors";
import type { ArenaUser, Challenge, Readiness } from "../../../lib/battle/battleTypes";
import { cn } from "../../../lib/cn";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";
import { INSET, RED_BUTTON } from "../battleStyles";
import PlayerSelect from "./PlayerSelect";

interface ManualAssignProps {
  users: ArenaUser[];
  battles: Challenge[];
  readiness: Readiness;
  busy: boolean;
  onAssign: (a: string, b: string) => Promise<{ success: boolean }>;
}

/** "Battle manuell zuweisen": zwei Spieler, dazwischen ein VS-Siegel, dann Zuweisen. */
export default function ManualAssign({ users, battles, readiness, busy, onAssign }: ManualAssignProps) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const ready = !!a && !!b;
  return (
    <div className={cn(INSET, "p-3")}>
      <p className="px-1 pb-2.5 text-[12px] font-medium text-slate-500 dark:text-neutral-400">{t.manualTitle}</p>
      <div className="relative flex flex-col gap-2">
        <PlayerSelect value={a} placeholder={t.player1} groups={playerGroups(users, b, battles, readiness)} onChange={setA} />
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 left-[1.625rem] z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[8px] font-bold tracking-wider ring-4 transition-colors duration-500",
            ready
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white ring-slate-50 dark:ring-neutral-900"
              : "bg-card text-red-500 ring-slate-50 shadow-sm dark:text-red-300 dark:ring-neutral-900",
          )}
        >
          {t.vs}
        </span>
        <PlayerSelect value={b} placeholder={t.player2} groups={playerGroups(users, a, battles, readiness)} onChange={setB} />
      </div>
      <button
        type="button"
        disabled={!ready || busy}
        onClick={async () => {
          if (!(await onAssign(a, b)).success) return;
          setA("");
          setB("");
        }}
        className={cn(RED_BUTTON, "mt-3 h-11 w-full rounded-xl text-sm font-semibold shadow-[0_10px_24px_-10px_rgba(220,38,38,0.7)] disabled:opacity-40 disabled:shadow-none")}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
        {t.assign}
      </button>
    </div>
  );
}
