import { Plus } from "lucide-react";
import { eur } from "../../../lib/tariff/eur";
import type { Tariff } from "../../../lib/tariff/tariffTypes";

interface MapTariffCardProps {
  tariff: Tariff;
  color: string;
  onPick: (tariff: Tariff) => void;
}

/** Ein Tarif zum Antippen: Name bzw. Bandbreite, Preise je Zeitraum, Startguthaben (v1 TariffButton). */
export default function MapTariffCard({ tariff, color, onPick }: MapTariffCardProps) {
  const oneTime = tariff.periods[0]?.price === 0 && tariff.oneTimeCosts;
  const energy = tariff.attributes?.arbeitspreisCt !== undefined;
  return (
    <button
      type="button"
      onClick={() => onPick(tariff)}
      className="glass-surface group flex w-full items-start gap-3 rounded-[24px] p-3 text-left transition-all duration-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98] dark:hover:border-white/20"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-slate-900 dark:text-white">
          {tariff.bandwidth ? `${tariff.bandwidth} Mbit/s` : tariff.name}
        </div>
        {tariff.bandwidth && <div className="text-[11px] text-slate-500 dark:text-white/50">{tariff.name}</div>}
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-white/55">
          {oneTime ? (
            <span>Einmalpreis {eur(tariff.oneTimeCosts?.setup ?? 0)}</span>
          ) : (
            tariff.periods.map((p) => (
              <span key={`${p.months}-${p.price}`}>
                {p.months ? `Monat ${p.months}: ` : ""}
                {eur(p.price)}
              </span>
            ))
          )}
          {energy && (
            <span>
              {tariff.attributes?.arbeitspreisCt} ct/kWh · {eur(tariff.attributes?.grundpreisEuroMonat ?? 0)}/Monat
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {tariff.startCredit ? <Badge text={`${tariff.startCredit} € Startguthaben`} /> : null}
          {tariff.attributes?.bonusEuro ? <Badge text={`+${tariff.attributes.bonusEuro} € Bonus`} /> : null}
          {tariff.commissionEuro ? <Badge text={`Provision ${eur(tariff.commissionEuro)}`} /> : null}
        </div>
      </div>
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white transition-transform duration-200 group-active:scale-90"
        style={{ background: color }}
      >
        <Plus size={16} />
      </span>
    </button>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
      {text}
    </span>
  );
}
