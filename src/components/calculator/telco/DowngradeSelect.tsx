import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { downgradeOptionLabel } from "../../../lib/tariff/telcoLabels";
import { canDowngrade } from "../../../lib/tariff/telcoNeu";
import { hasTariff } from "../../../lib/tariff/telcoTypes";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import Reveal from "../../ui/Reveal";
import Field from "./Field";
import RemoveButton from "./RemoveButton";
import TariffSelect from "./TariffSelect";

interface DowngradeSelectProps {
  sell: TelcoPencilSell;
}

/** Wechsel auf einen kleineren Tarif ab dem 10. Monat (nur Kabel Neu und Glasfaser). */
export default function DowngradeSelect({ sell }: DowngradeSelectProps) {
  const { state: s, loaded, downgrades, actions } = sell;
  return (
    <Reveal show={canDowngrade(s) && hasTariff(s)}>
      <Field label={t.downgrade} htmlFor="neu-downgrade">
        <div className="flex items-center gap-2">
          <TariffSelect id="neu-downgrade" value={s.downgradeId} onChange={(downgradeId) => actions.patch({ downgradeId })}>
            <option value="none">{t.noDowngrade}</option>
            {downgrades.map((x) => (
              <option key={x.id} value={x.id}>
                {downgradeOptionLabel(s.portfolio, x, loaded)}
              </option>
            ))}
          </TariffSelect>
          <RemoveButton show={s.downgradeId !== "none"} onClick={() => actions.patch({ downgradeId: "none" })} />
        </div>
      </Field>
    </Reveal>
  );
}
