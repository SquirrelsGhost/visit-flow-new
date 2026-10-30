import { Crown, Thermometer } from "lucide-react";
import { cn } from "../../../lib/cn";
import { battleLogTexts as t } from "../../../texts/battleAdminTexts";
import { initial } from "../battleStyles";

interface BattleLogSideProps {
  name: string;
  winner: boolean;
  dimmed: boolean;
  sick: boolean;
  /** Teamfarbe wie in den Live-Duellen: links Rot, rechts Blau. */
  side?: "left" | "right";
}

/** Eine Seite einer Paarung: Kürzel, Name; Sieger mit Krone, Verlierer leicht zurückgenommen, Krankmeldung mit Thermometer. */
export default function BattleLogSide({ name, winner, dimmed, sick, side = "left" }: BattleLogSideProps) {
  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-1.5 transition-opacity duration-300", dimmed && "opacity-55")}>
      <span className="relative">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
            winner
              ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_6px_16px_-6px_rgba(245,158,11,0.75)]"
              : cn("bg-gradient-to-br text-white", side === "left" ? "from-rose-400 via-red-500 to-red-700" : "from-sky-400 via-blue-500 to-indigo-700"),
          )}
        >
          {initial(name)}
        </span>
        {winner && (
          <span title={t.winner} className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-500">
            <Crown className="h-3.5 w-3.5 fill-amber-400" />
          </span>
        )}
        {sick && (
          <span title={t.sickMark} className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-orange-500 shadow ring-1 ring-orange-200 dark:bg-neutral-900 dark:ring-orange-500/30">
            <Thermometer aria-label={t.sickMark} className="h-3 w-3" />
          </span>
        )}
      </span>
      <span className="w-full truncate text-center text-[13px] font-medium text-slate-800 dark:text-neutral-100">{name}</span>
    </div>
  );
}
