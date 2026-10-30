import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { eur } from "../../../lib/tariff/eur";
import { TELCO_FEES } from "../../../lib/tariff/telcoCatalog";
import { pencilSellTvTexts as t } from "../../../texts/pencilSellTexts";
import PayTvTile from "./PayTvTile";
import { CALC_LABEL, CALC_TILE } from "../calcGlass";

interface TvAddonsProps {
  sell: TelcoPencilSell;
}

const STEP = "flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--glass-track)] text-lg leading-none transition-colors hover:bg-[var(--glass-press)] disabled:opacity-40";
const HEAD = `mb-2 ${CALC_LABEL}`;

/** Giga-TV-Erweiterungen: Multiroom (bis 2) und Pay-TV-Pakete. */
export default function TvAddons({ sell }: TvAddonsProps) {
  const { state: s, quote, actions } = sell;
  const count = s.gigaMultiroomCount;
  const max = TELCO_FEES.multiroomMax;
  return (
    <div className="mt-4 space-y-4">
      <div>
        <h4 className={HEAD}>{t.extensions}</h4>
        <div className={`${CALC_TILE} overflow-hidden px-4 py-3`}>
          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto] sm:gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium leading-5">{t.multiroom}</div>
              <div className="text-xs leading-4 text-muted-foreground">{`(+${eur(TELCO_FEES.multiroom)}${t.multiroomEach})`}</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" className={STEP} disabled={count === 0} aria-label={t.multiroomLess} onClick={() => actions.patch({ gigaMultiroomCount: Math.max(0, count - 1) })}>
                -
              </button>
              <span className="w-12 text-center text-sm font-semibold tabular-nums">
                {count}/{max}
              </span>
              <button type="button" className={STEP} disabled={count === max} aria-label={t.multiroomMore} onClick={() => actions.patch({ gigaMultiroomCount: Math.min(max, count + 1) })}>
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h4 className={HEAD}>{t.payTv}</h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <PayTvTile
            label={t.premium}
            included={quote.add.premiumIncluded}
            selected={s.gigaAddPremium}
            cost={quote.add.premiumAddonCost}
            onToggle={() => actions.patch({ gigaAddPremium: !s.gigaAddPremium })}
          />
          <PayTvTile
            label={t.netflix}
            included={quote.add.netflixIncluded}
            selected={s.gigaAddNetflix}
            cost={quote.add.netflixAddonCost}
            onToggle={() => actions.patch({ gigaAddNetflix: !s.gigaAddNetflix })}
          />
        </div>
      </div>
    </div>
  );
}
