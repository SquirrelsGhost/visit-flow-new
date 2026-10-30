import { Users } from "lucide-react";
import { cn } from "../../lib/cn";
import type { SellerSummary } from "../../lib/backoffice/backofficeTypes";
import { STORNO_LIMIT } from "../../lib/crm/crmLogic";
import { ALL_USERS } from "../../lib/crmOverview/overviewTypes";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import GlassChip from "../glass/GlassChip";
import GlassRow from "../glass/GlassRow";
import GlassRowText from "../glass/GlassRowText";
import GlassSection from "../glass/GlassSection";
import { GLASS_ROW, GLASS_ROW_INTERACTIVE } from "../glass/glassStyles";

interface BackofficeSellersProps {
  sellers: readonly SellerSummary[];
  activeId: string;
  onPick: (userId: string) => void;
}

const MAX = 8;
const AVATAR = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[14px] font-semibold text-white shadow-[0_6px_16px_-6px] shadow-blue-500/40 ring-1 ring-inset ring-white/25";

function Quote({ value }: { value: number | null }) {
  if (value === null) return <span className="w-12 shrink-0 text-right text-[13px] text-muted-foreground">–</span>;
  const over = value > STORNO_LIMIT;
  return <span className={cn("w-12 shrink-0 text-right text-[13px] font-semibold tabular-nums", over ? "text-red-600 dark:text-red-300" : "text-emerald-600 dark:text-emerald-400")}>{Math.round(value)} %</span>;
}

/** Wer im Team wie viel offen hat und wie seine Stornoquote steht; Tippen filtert die Liste. */
export default function BackofficeSellers({ sellers, activeId, onPick }: BackofficeSellersProps) {
  if (sellers.length === 0) return null;
  return (
    <GlassSection label={t.sellers} footer={t.sellersFooter}>
      {activeId !== ALL_USERS && <GlassRow icon={Users} tone="gray" title={t.showAll} onClick={() => onPick(ALL_USERS)} />}
      {sellers.slice(0, MAX).map((s) => (
        <button key={s.id} type="button" aria-pressed={activeId === s.id} onClick={() => onPick(activeId === s.id ? ALL_USERS : s.id)} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, activeId === s.id && "bg-[var(--glass-hover)]")}>
          <span aria-hidden className={AVATAR}>
            {s.name.charAt(0).toUpperCase()}
          </span>
          <GlassRowText title={s.name} subtitle={t.sellerLine(s.open, s.completed)} />
          {s.open > 0 && <GlassChip tone="amber">{t.openCount(s.open)}</GlassChip>}
          <Quote value={s.quote} />
        </button>
      ))}
    </GlassSection>
  );
}
