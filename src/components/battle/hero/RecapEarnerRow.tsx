import type { TopEarner } from "../../../lib/battle/battleTypes";
import GlassNumber from "../../glass/GlassNumber";

interface RecapEarnerRowProps {
  earner: TopEarner;
  /** Position unterhalb des Podests (0 = Platz 4). */
  index: number;
}

/** Platz 4 und 5 unter dem Podest: schlichte Zeile mit Rang, Name und Provision. */
export default function RecapEarnerRow({ earner, index }: RecapEarnerRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-3.5 py-2.5 ring-1 ring-inset ring-white/[0.08]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[12px] font-semibold text-white/70">{index + 4}</span>
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-white/85">{earner.name}</span>
      <GlassNumber value={earner.totalCommission} kind="euro" duration={1.1} className="text-[14px] font-semibold text-white/80" />
    </div>
  );
}
