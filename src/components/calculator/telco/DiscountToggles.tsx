import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { eur } from "../../../lib/tariff/eur";
import { hasTariff } from "../../../lib/tariff/telcoTypes";
import { pencilSellSummaryTexts as t } from "../../../texts/pencilSellTexts";
import Reveal from "../../ui/Reveal";
import OptionTile from "./OptionTile";
import { CALC_INPUT } from "../calcGlass";

interface DiscountTogglesProps {
  sell: TelcoPencilSell;
}

/** Gutschrift, TV-Rabatte und Tarifwechselgebühr (v1 DiscountToggles). */
export default function DiscountToggles({ sell }: DiscountTogglesProps) {
  const { state: s, quote, actions } = sell;
  const creditMax = quote.neu.creditMax;
  const creditOn = s.applyCredit && creditMax > 0;
  return (
    <>
      {creditMax > 0 && (
        <OptionTile label={t.credit} active={creditOn} onToggle={() => actions.patch({ applyCredit: !s.applyCredit })}>
          <Reveal show={creditOn}>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                max={creditMax}
                value={s.creditOverride}
                placeholder={String(creditMax)}
                aria-label={t.credit}
                onChange={(e) => actions.patch({ creditOverride: e.target.value })}
                className={`${CALC_INPUT} h-10 w-32`}
              />
              <span className="text-xs text-muted-foreground">
                {t.creditMax} {eur(creditMax)}
              </span>
            </div>
          </Reveal>
        </OptionTile>
      )}
      {quote.add.tvAutoDiscount > 0 && <OptionTile label={t.tvAuto} active badge={t.automatic} />}
      {quote.add.tvComboEligible && (
        <OptionTile label={t.tvCombo} active={s.applyTvCombo} onToggle={() => actions.patch({ applyTvCombo: !s.applyTvCombo })} />
      )}
      {s.portfolio === "kabel-upsell" && hasTariff(s) && (
        <OptionTile
          label={t.feeCredit}
          active={s.applyTariffChangeFeeCredit}
          onToggle={() => actions.patch({ applyTariffChangeFeeCredit: !s.applyTariffChangeFeeCredit })}
        />
      )}
    </>
  );
}
