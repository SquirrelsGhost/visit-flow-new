import type { ContestClock } from "../../../lib/overview/contestLogic";
import { overviewTexts } from "../../../texts/overviewTexts";

interface ContestCountdownProps {
  countdown: NonNullable<ContestClock["countdown"]>;
}

const texts = overviewTexts.contest;
const CELL = "rounded-2xl bg-white/[0.08] py-2.5 text-center ring-1 ring-inset ring-white/10";

/** Countdown bis zum Start in vier Glasfeldern (Tage, Stunden, Minuten, Sekunden). */
export default function ContestCountdown({ countdown }: ContestCountdownProps) {
  const cells = [
    [countdown.days, texts.units.days],
    [countdown.hours, texts.units.hours],
    [countdown.minutes, texts.units.minutes],
    [countdown.seconds, texts.units.seconds],
  ] as const;
  return (
    <div className="mt-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{texts.startsIn}</p>
      <div className="mt-2 grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {cells.map(([value, unit]) => (
          <div key={unit} className={CELL}>
            <div className="text-[22px] font-semibold tabular-nums leading-none text-white">{value}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">{unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
