import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { euroWhole } from "../../lib/simulator/simulatorFormat";
import type { SimTariff } from "../../lib/simulator/simulatorTypes";
import { eur } from "../../lib/tariff/eur";
import { fill } from "../../texts/profileTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import { ROW, ROW_INTERACTIVE, ROW_SUBTITLE, ROW_TITLE } from "../settings/settingsStyles";
import { MONEY } from "./simulatorStyles";

interface TariffRowProps {
  tariff: SimTariff;
  onAdd: () => void;
}

/** Ein Tarif zum Antippen: Name, Monatspreis, Provision. Tippen legt ihn in den Warenkorb. */
export default function TariffRow({ tariff, onAdd }: TariffRowProps) {
  const hasCommission = tariff.commissionEuro > 0;
  return (
    <motion.button type="button" onClick={onAdd} whileTap={{ scale: 0.985 }} aria-label={fill(t.tariffs.add, { name: tariff.name })} className={cn(ROW, ROW_INTERACTIVE, "group")}>
      <span className="min-w-0 flex-1">
        <span className={cn(ROW_TITLE, "truncate")}>{tariff.name}</span>
        {tariff.price !== undefined && <span className={ROW_SUBTITLE}>{fill(t.tariffs.perMonth, { price: eur(tariff.price) })}</span>}
      </span>
      <span className={cn("shrink-0 text-[14px] font-semibold", MONEY, hasCommission ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")}>
        {hasCommission ? `+${euroWhole(tariff.commissionEuro)}` : "—"}
      </span>
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--glass-track)] text-slate-500 transition-colors duration-300 group-hover:bg-red-500 group-hover:text-white dark:text-white/60"
      >
        <Plus className="h-4 w-4" />
      </span>
    </motion.button>
  );
}
