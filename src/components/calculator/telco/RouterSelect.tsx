import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { eur } from "../../../lib/tariff/eur";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import Reveal from "../../ui/Reveal";
import Field from "./Field";
import RemoveButton from "./RemoveButton";
import TariffSelect from "./TariffSelect";

interface RouterSelectProps {
  sell: TelcoPencilSell;
}

/** Router zur Miete oder zum Kauf, mit Versandkosten-Hinweis. */
export default function RouterSelect({ sell }: RouterSelectProps) {
  const { state: s, routerOptions, shipping, actions } = sell;
  return (
    <div className="space-y-1">
      <Field label={t.router} htmlFor="neu-router">
        <div className="flex items-center gap-2">
          <TariffSelect id="neu-router" value={s.routerId} onChange={(routerId) => actions.patch({ routerId })}>
            {routerOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} {o.monthly ? `(+${eur(o.monthly)}/M)` : o.oneTime ? `(+${eur(o.oneTime)} ${t.oneTimeSuffix})` : ""}
              </option>
            ))}
          </TariffSelect>
          <RemoveButton show={s.routerId !== "none"} onClick={() => actions.patch({ routerId: "none" })} />
        </div>
      </Field>
      <Reveal show={s.routerId !== "none"}>
        <p className="pt-1 text-xs text-muted-foreground">
          {t.shipping} {eur(shipping)}
        </p>
      </Reveal>
    </div>
  );
}
