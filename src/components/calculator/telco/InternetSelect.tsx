import { eur } from "../../../lib/tariff/eur";
import { UPSELL_LOYALTY_TARIFFS, UPSELL_WINBACK_TARIFFS } from "../../../lib/tariff/telcoCatalog";
import { sortedTariffs, tariffOptionLabel } from "../../../lib/tariff/telcoLabels";
import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { hasTariff, type SimpleTariff } from "../../../lib/tariff/telcoTypes";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import Field from "./Field";
import RemoveButton from "./RemoveButton";
import TariffSelect from "./TariffSelect";

interface InternetSelectProps {
  sell: TelcoPencilSell;
}

const byPriceDesc = (list: SimpleTariff[]) => [...list].sort((a, b) => b.monthly - a.monthly);

/** Internet-Tarif mit den geheimen Upsell-Listen (Treue, Winback), Bereitstellung und Wechselgebühr. */
export default function InternetSelect({ sell }: InternetSelectProps) {
  const { state: s, meta, loaded, actions, secret } = sell;
  const upsell = s.portfolio === "kabel-upsell";
  const secretGroup = (label: string, list: SimpleTariff[]) => (
    <optgroup label={label}>
      {byPriceDesc(list).map((x) => (
        <option key={x.id} value={x.id}>
          Giga Zuhause {x.name} - {eur(x.monthly)}/M
        </option>
      ))}
    </optgroup>
  );
  return (
    <Field label={t.internetFestnetz} htmlFor="neu-internet" onLabelClick={secret.tap}>
      <div className="flex items-center gap-2">
        <TariffSelect id="neu-internet" value={s.tariffId ?? ""} onChange={actions.selectTariff} placeholder={t.chooseInternet}>
          <option value="none">{t.noInternet}</option>
          {sortedTariffs(meta.tariffs, loaded).map((x) => (
            <option key={x.id} value={x.id}>
              {tariffOptionLabel(s.portfolio, x, loaded)}
            </option>
          ))}
          {upsell && s.upsellLoyaltyUnlocked && secretGroup(t.upsellLoyaltyGroup, UPSELL_LOYALTY_TARIFFS)}
          {upsell && s.upsellWinbackUnlocked && secretGroup(t.winbackGroup, UPSELL_WINBACK_TARIFFS)}
        </TariffSelect>
        <RemoveButton show={hasTariff(s)} onClick={actions.removeTariff} />
      </div>
      {hasTariff(s) && meta.oneOffs > 0 && (
        <p className="text-xs text-muted-foreground">
          {t.setup} {eur(meta.oneOffs)}
        </p>
      )}
      {upsell && hasTariff(s) && <p className="text-xs text-muted-foreground">{t.tariffChangeFeeHint}</p>}
    </Field>
  );
}
