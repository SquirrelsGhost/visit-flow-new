import { battleTexts as t } from "../../../texts/battleTexts";
import GlassNumber from "../../glass/GlassNumber";

interface RecapTallyProps {
  battles: number;
  wins: number;
  draws: number;
}

/** Kleine Bilanz rechts im Rückblick: Battles, Siege, Remis als Zahlenreihe. */
export default function RecapTally({ battles, wins, draws }: RecapTallyProps) {
  const items = [
    { label: t.battlesShort, value: battles, tone: "text-white" },
    { label: t.winsShort, value: wins, tone: "text-amber-300" },
    { label: t.drawsShort, value: draws, tone: "text-sky-300" },
  ];
  return (
    <dl className="flex shrink-0 gap-3.5 text-right">
      {items.map((item) => (
        <div key={item.label}>
          <dd className={`text-[20px] font-semibold leading-none tabular-nums ${item.tone}`}>
            <GlassNumber value={item.value} duration={0.8} />
          </dd>
          <dt className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}
