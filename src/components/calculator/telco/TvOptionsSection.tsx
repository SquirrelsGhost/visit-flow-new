import { Check } from "lucide-react";
import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { cn } from "../../../lib/cn";
import { eur } from "../../../lib/tariff/eur";
import { pencilSellTexts as p, pencilSellTvTexts as t } from "../../../texts/pencilSellTexts";
import Reveal from "../../ui/Reveal";
import RemoveButton from "./RemoveButton";
import TariffSelect from "./TariffSelect";
import TvAddons from "./TvAddons";
import { CALC_FIELD_LABEL, CALC_TILE } from "../calcGlass";

interface TvOptionsSectionProps {
  sell: TelcoPencilSell;
}

/** TV-Auswahl mit "Bereits Giga", automatisch enthaltenem TV Connect Standard und Erweiterungen. */
export default function TvOptionsSection({ sell }: TvOptionsSectionProps) {
  const { state: s, gigaOptions, quote, actions } = sell;
  const selected = gigaOptions.find((o) => o.id === s.gigaId);
  const name = (selected?.name || "").toLowerCase();
  const isGigaTv =
    !!selected && selected.id !== "none" && (s.isTvBestand || name.includes("giga tv") || name.includes("gigatv")) && !name.includes("mobile-app");
  const std = quote.add.tvConnectStdMonthly;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="neu-tv" className={`cursor-default select-none ${CALC_FIELD_LABEL}`}>
          {p.tv}
        </label>
        <button
          type="button"
          aria-pressed={s.isTvBestand}
          onClick={() => actions.patch({ isTvBestand: !s.isTvBestand })}
          className={cn(
            "flex select-none items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-200",
            s.isTvBestand
              ? "scale-100 border-transparent bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_6px_14px_-6px_rgba(220,38,38,0.7)]"
              : "scale-95 border-transparent bg-[var(--glass-track)] text-muted-foreground hover:scale-100 hover:text-foreground",
          )}
        >
          {s.isTvBestand && <Check className="h-3.5 w-3.5" />}
          {t.alreadyGiga}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <TariffSelect id="neu-tv" value={s.gigaId} onChange={(gigaId) => actions.patch({ gigaId })}>
          {gigaOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </TariffSelect>
        <RemoveButton show={s.gigaId !== "none"} onClick={() => actions.patch({ gigaId: "none" })} />
      </div>
      <Reveal show={isGigaTv}>
        <div className={`${CALC_TILE} mt-2 flex items-center justify-between gap-2 px-4 py-2.5 text-xs`}>
          <span className="font-medium">{t.tvConnectStandard}</span>
          <span className="text-muted-foreground">
            {t.autoIncluded} • {std > 0 ? `+${eur(std)}/Monat` : "0,00 €/Monat"}
          </span>
        </div>
        <TvAddons sell={sell} />
      </Reveal>
    </div>
  );
}
