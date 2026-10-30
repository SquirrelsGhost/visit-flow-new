import { Check, Crown } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { formatEnergiePreis, formatEuro } from "../../../lib/energy/energyNumbers";
import type { TarifVorschau } from "../../../lib/energy/energyPreview";
import type { Tariff } from "../../../lib/tariff/tariffTypes";
import { energyTexts as t } from "../../../texts/energyTexts";
import { CALC_TILE, CALC_TILE_HOVER } from "../calcGlass";

interface TariffChipProps {
  tarif: Tariff;
  vorschau: TarifVorschau | undefined;
  gewaehlt: boolean;
  chipKlasse: string;
  hakenKlasse: string;
  onClick: () => void;
}

/** Ein Tarif aus der Verwaltung zum Antippen: Name, Preise, Bonus und was er dem Kunden spart. */
export default function TariffChip({ tarif, vorschau, gewaehlt, chipKlasse, hakenKlasse, onClick }: TariffChipProps) {
  const a = tarif.attributes;
  const cent = vorschau?.ersparnisCent ?? null;
  return (
    <motion.button
      type="button"
      aria-pressed={gewaehlt}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex min-h-[64px] items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        gewaehlt ? chipKlasse : cn(CALC_TILE, CALC_TILE_HOVER),
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
          gewaehlt ? hakenKlasse : "bg-[var(--glass-track)]",
        )}
      >
        {gewaehlt && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          <span className="truncate">{tarif.name}</span>
          {vorschau?.bester && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              <Crown className="h-2.5 w-2.5" /> {t.bester}
            </span>
          )}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">
          {formatEnergiePreis(a?.arbeitspreisCt ?? 0, a?.grundpreisEuroMonat ?? 0)}
          {a?.bonusEuro ? t.bonusSuffix(a.bonusEuro) : ""}
        </span>
      </span>
      {cent !== null && (
        <span
          className={cn(
            "shrink-0 text-right text-xs font-bold tabular-nums",
            cent > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
          )}
        >
          {cent > 0 ? t.spart(formatEuro(cent)) : t.teurerChip}
        </span>
      )}
    </motion.button>
  );
}
