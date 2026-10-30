import { ChevronLeft, ChevronRight } from "lucide-react";
import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";

interface ContestPagerProps {
  index: number;
  count: number;
  onChange: (index: number) => void;
}

const texts = overviewTexts.contest;
const BUTTON = "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[var(--glass-hover)] disabled:opacity-30";

/** Blättern, wenn in einem Bereich mehrere Gewinnspiele laufen. */
export default function ContestPager({ index, count, onChange }: ContestPagerProps) {
  return (
    <div className="glass-surface mx-auto flex max-w-[14rem] items-center justify-between rounded-full px-1.5 py-1">
      <button type="button" className={BUTTON} onClick={() => onChange(index - 1)} disabled={index === 0} aria-label={texts.previous}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-[13px] font-semibold tabular-nums text-foreground">{fill(texts.pager, { index: index + 1, count })}</span>
      <button type="button" className={BUTTON} onClick={() => onChange(index + 1)} disabled={index >= count - 1} aria-label={texts.next}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
