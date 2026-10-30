// Zeigt nach dem Kopieren kurz einen Haken
"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { activeBattlesText, copyText } from "../../lib/battle/battleClipboard";
import type { Challenge, StreakMap } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import { ROUND_GLASS_BUTTON } from "./battleStyles";

interface CopyBattlesButtonProps {
  battles: Challenge[];
  streaks: StreakMap;
}

/** Kopiert die aktiven Battles als WhatsApp-Text mit Serien (↑ Sieg, ↓ Niederlage). */
export default function CopyBattlesButton({ battles, streaks }: CopyBattlesButtonProps) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={t.copyBattles}
      aria-label={t.copyBattles}
      onClick={async () => {
        if (!(await copyText(activeBattlesText(battles, streaks)))) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={cn(ROUND_GLASS_BUTTON, "no-touch-target-fix -my-2 h-8 w-8")}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
