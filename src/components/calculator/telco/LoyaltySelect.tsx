import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { eur } from "../../../lib/tariff/eur";
import { withBandwidth } from "../../../lib/tariff/telcoLabels";
import { hasTariff } from "../../../lib/tariff/telcoTypes";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import Reveal from "../../ui/Reveal";
import Field from "./Field";
import RemoveButton from "./RemoveButton";
import TariffSelect from "./TariffSelect";

interface LoyaltySelectProps {
  sell: TelcoPencilSell;
}

const speed = (name: string) => parseInt(name, 10);

/** Geheimer "Treuewechsel ab 13. Monat" (Kabel Neu): gleich schnelle oder langsamere Tarife, Vertrag 36 Monate. */
export default function LoyaltySelect({ sell }: LoyaltySelectProps) {
  const { state: s, meta, loaded, current, actions } = sell;
  const currentSpeed = speed(String(current?.name ?? ""));
  const options = meta.tariffs
    .filter((x) => !(Number.isFinite(currentSpeed) && Number.isFinite(speed(x.name))) || speed(x.name) <= currentSpeed)
    .sort((a, b) => speed(b.name) - speed(a.name));
  return (
    <Reveal show={s.loyaltyUnlocked && s.portfolio === "kabel-neu" && hasTariff(s)}>
      <Field label={t.loyalty} htmlFor="neu-loyalty">
        <div className="flex items-center gap-2">
          <TariffSelect id="neu-loyalty" value={s.loyaltyTariffId} onChange={(loyaltyTariffId) => actions.patch({ loyaltyTariffId })}>
            <option value="none">{t.noLoyalty}</option>
            {options.map((x) => (
              <option key={x.id} value={x.id}>
                Giga Zuhause {x.name}
                {withBandwidth(loaded, x.id)} ({eur(x.b ?? x.a6 ?? 0)}/Monat)
              </option>
            ))}
          </TariffSelect>
          <RemoveButton show={s.loyaltyTariffId !== "none"} onClick={() => actions.patch({ loyaltyTariffId: "none" })} />
        </div>
      </Field>
    </Reveal>
  );
}
