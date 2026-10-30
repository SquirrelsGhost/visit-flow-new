import { solarTexts as t } from "../../../texts/solarTexts";
import ModeToggle from "./ModeToggle";
import { TILE } from "./solarStyles";

interface PaymentToggleProps {
  financed: boolean;
  onChange: (financed: boolean) => void;
}

/** Nur beim Kauf: Direktkauf oder Finanzierung. */
export default function PaymentToggle({ financed, onChange }: PaymentToggleProps) {
  return (
    <div className={`${TILE} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}>
      <div>
        <span className="block text-[15px] font-semibold">{t.payment}</span>
        <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{t.paymentText}</span>
      </div>
      <ModeToggle
        tone="soft"
        options={[
          { id: "cash", label: t.cash },
          { id: "fin", label: t.financing },
        ]}
        value={financed ? "fin" : "cash"}
        onChange={(v) => onChange(v === "fin")}
      />
    </div>
  );
}
