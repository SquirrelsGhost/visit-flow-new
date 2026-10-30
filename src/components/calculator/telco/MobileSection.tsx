import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { pencilSellTvTexts as t } from "../../../texts/pencilSellTexts";
import Reveal from "../../ui/Reveal";
import Field from "./Field";
import MobileDetails from "./MobileDetails";
import RemoveButton from "./RemoveButton";
import TariffSelect from "./TariffSelect";

interface MobileSectionProps {
  sell: TelcoPencilSell;
}

/** GigaMobil-Auswahl; die Details klappen weich auf, sobald ein Tarif gewählt ist. */
export default function MobileSection({ sell }: MobileSectionProps) {
  const { state: s, mobilePlans, actions } = sell;
  return (
    <>
      <Field label={t.mobile} htmlFor="neu-mobile">
        <div className="flex items-center gap-2">
          <TariffSelect id="neu-mobile" value={s.mobileId} onChange={actions.setMobileId}>
            <option value="none">{t.noMobile}</option>
            {mobilePlans
              .filter((o) => o.id !== "none")
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
          </TariffSelect>
          <RemoveButton show={s.mobileId !== "none"} onClick={() => actions.setMobileId("none")} />
        </div>
      </Field>
      <Reveal show={s.mobileId !== "none"}>
        <MobileDetails sell={sell} />
      </Reveal>
    </>
  );
}
