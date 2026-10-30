import { Copy, Share2, ShoppingCart, Trash2 } from "lucide-react";
import { pencilSellSummaryTexts as t } from "../../../texts/pencilSellTexts";
import GlassNumber from "../../glass/GlassNumber";
import GlassSheen from "../../glass/GlassSheen";
import GlassStat from "../../glass/GlassStat";
import AnimatedEuro from "../../ui/AnimatedEuro";
import Reveal from "../../ui/Reveal";
import { CALC_CARD, CALC_DEEP, CALC_SECONDARY, CALC_SUCCESS, CALC_TILE } from "../calcGlass";

interface SummaryFooterProps {
  monthsLabel: string;
  altTotal: number;
  neuTotal: number;
  ersparnis: number;
  neuAvg: number;
  hasTariff: boolean;
  onCopy: () => void;
  onShare: () => void;
  onClear: () => void;
  onTransfer: () => void;
}

const TILE = `${CALC_TILE} p-3.5`;
const TILE_LABEL = "text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";

/** Ergebnis des Vergleichs: Ersparnis als tiefe Glaskarte, Alt gegen Neu, darunter die Aktionen. */
export default function SummaryFooter(props: SummaryFooterProps) {
  const { monthsLabel, altTotal, neuTotal, ersparnis, neuAvg, hasTariff, onCopy, onShare, onClear, onTransfer } = props;
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <div className={`${CALC_DEEP} px-5 pb-5 pt-6`}>
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-transparent" />
        <GlassSheen />
        <GlassStat label={`${t.savings} (${monthsLabel})`} size="hero" onDeep className="relative">
          <GlassNumber value={ersparnis} kind="euro" />
        </GlassStat>
        <p className="relative mt-2 text-[14px] text-white/65">
          {t.avgNeu} <AnimatedEuro value={neuAvg} suffix="/Monat" className="font-semibold text-white" />
        </p>
      </div>
      <div className={`${CALC_CARD} space-y-3`}>
        <div className="grid grid-cols-2 gap-2">
          <div className={TILE}>
            <div className={TILE_LABEL}>
              {t.altTotal} ({monthsLabel})
            </div>
            <AnimatedEuro value={altTotal} className="mt-1 block text-[19px] font-semibold tracking-[-0.02em] tabular-nums" />
          </div>
          <div className={TILE}>
            <div className={TILE_LABEL}>
              {t.neuTotal} ({monthsLabel})
            </div>
            <AnimatedEuro value={neuTotal} className="mt-1 block text-[19px] font-semibold tracking-[-0.02em] tabular-nums" />
          </div>
        </div>
        <Reveal show={hasTariff}>
          <button type="button" onClick={onTransfer} className={CALC_SUCCESS}>
            <ShoppingCart className="h-4 w-4" /> {t.transfer}
          </button>
        </Reveal>
        <div className="flex gap-2">
          <button type="button" onClick={onCopy} className={`${CALC_SECONDARY} flex-1`}>
            <Copy className="h-4 w-4" /> {t.copy}
          </button>
          <button type="button" onClick={onShare} aria-label={t.share} className={CALC_SECONDARY}>
            <Share2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClear} aria-label={t.clear} className={`${CALC_SECONDARY} text-red-600 dark:text-red-400`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
