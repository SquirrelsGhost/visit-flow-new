import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { eur } from "../../../lib/tariff/eur";
import { pencilSellTvTexts as t } from "../../../texts/pencilSellTexts";
import { CALC_TILE, CALC_TILE_HOVER, CALC_TILE_ON } from "../calcGlass";

interface PayTvTileProps {
  label: string;
  included: boolean;
  selected: boolean;
  cost: number;
  onToggle: () => void;
}

/** Pay-TV-Paket (Premium, Netflix): an/aus, oder ausgegraut, wenn es schon im Tarif steckt. */
export default function PayTvTile({ label, included, selected, cost, onToggle }: PayTvTileProps) {
  const on = !included && selected;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={included}
      onClick={onToggle}
      className={cn(
        "px-4 py-3 text-left",
        on ? CALC_TILE_ON : CALC_TILE,
        included ? "cursor-not-allowed opacity-60" : CALC_TILE_HOVER,
      )}
    >
      <span className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border transition-colors", on ? "border-transparent bg-gradient-to-b from-emerald-400 to-emerald-500" : "border-[var(--glass-label)]/40")}>
          {on && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 25 }}>
              <Check className="h-3 w-3 text-white" />
            </motion.span>
          )}
        </span>
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{included ? t.inTariff : `+${eur(cost)} mtl.`}</span>
    </button>
  );
}
