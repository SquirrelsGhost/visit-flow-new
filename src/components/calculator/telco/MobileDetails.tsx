import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { cn } from "../../../lib/cn";
import { eur } from "../../../lib/tariff/eur";
import { pencilSellTvTexts as t } from "../../../texts/pencilSellTexts";
import FamilyCards from "./FamilyCards";
import OptionTile from "./OptionTile";
import { CALC_FIELD_LABEL, CALC_TILE } from "../calcGlass";

interface MobileDetailsProps {
  sell: TelcoPencilSell;
}

const ROW = "grid grid-cols-2 gap-3 rounded-xl bg-white/50 px-3 py-2 dark:bg-white/[0.03]";

/** Details zum GigaMobil-Tarif: Datenvolumen, Promo-Rabatt, Unlimited, GigaKombi, Family Cards. */
export default function MobileDetails({ sell }: MobileDetailsProps) {
  const { state: s, quote, familyCards, actions } = sell;
  const plan = quote.add.mobile;
  const volume = plan?.supportsUnlimitedUpgrade
    ? s.mobileUnlimited
      ? t.unlimited
      : `${plan?.dataGb ?? ""} GB`
    : s.mobileId === "gm_xl"
      ? t.unlimited
      : `${plan?.dataGb ?? ""} GB`;
  return (
    <div className={`${CALC_TILE} space-y-2 p-3.5`}>
      <div className={CALC_FIELD_LABEL}>{t.mobileDetails}</div>
      <div className={ROW}>
        <div className="text-xs font-medium text-muted-foreground">{t.dataVolume}</div>
        <div className="text-right text-xs font-medium text-muted-foreground">{t.discount}</div>
      </div>
      <div className={ROW}>
        <div className="text-sm font-medium">{volume}</div>
        <div className="text-right text-sm font-medium text-destructive">- {eur(quote.add.mobilePromo20)}/Monat</div>
      </div>
      {plan?.supportsUnlimitedUpgrade && (
        <div>
          <button
            type="button"
            aria-pressed={s.mobileUnlimited}
            onClick={() => actions.patch({ mobileUnlimited: !s.mobileUnlimited })}
            className={cn(
              "h-10 w-full rounded-xl text-xs font-semibold transition-colors duration-300",
              s.mobileUnlimited ? "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_6px_16px_-8px_rgba(220,38,38,0.7)]" : "bg-[var(--glass-track)] hover:bg-[var(--glass-press)]",
            )}
          >
            {s.mobileUnlimited ? t.unlimitedOn : t.unlimitedOff}
          </button>
        </div>
      )}
      {quote.add.canApplyMobileCombo && (
        <OptionTile
          label={`${t.gigaKombi} (-10,00 € / Monat)`}
          active={s.applyMobileCombo}
          onToggle={() => actions.patch({ applyMobileCombo: !s.applyMobileCombo })}
        />
      )}
      <FamilyCards cards={s.selectedFamilyCards} options={familyCards} onChange={(selectedFamilyCards) => actions.patch({ selectedFamilyCards })} />
    </div>
  );
}
