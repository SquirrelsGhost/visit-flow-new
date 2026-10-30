import { Minus, Plus } from "lucide-react";
import { cn } from "../../../lib/cn";
import type { Tariff } from "../../../lib/tariff/tariffTypes";
import { CHIP_ACTIVE, CHIP_BASE, CHIP_IDLE, STEP_LABEL } from "../steps/stepStyles";

interface MapGigaExtrasProps {
  payTv: Tariff[];
  hasMultiroom: boolean;
  multiroom: number;
  onMultiroom: (n: number) => void;
  selectedPayTv: string[];
  onTogglePayTv: (name: string) => void;
  color: string;
}

const STEPPER = "grid h-9 w-9 place-items-center rounded-xl border border-[var(--glass-divider)] bg-card text-slate-700 transition active:scale-90 disabled:opacity-40 dark:bg-white/5 dark:text-white";

/** GigaTV-Zusätze vor dem Tarif-Tipp: bis zu zwei Multiroom-Boxen und PayTV (v1 GigaTV-Layout). */
export default function MapGigaExtras({ payTv, hasMultiroom, multiroom, onMultiroom, selectedPayTv, onTogglePayTv, color }: MapGigaExtrasProps) {
  if (!hasMultiroom && payTv.length === 0) return null;
  return (
    <div className="mb-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
      {hasMultiroom && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Multiroom-Box</div>
            <div className="text-[11px] text-slate-500 dark:text-white/50">Wird mit dem GigaTV-Tarif hinzugefügt</div>
          </div>
          <button type="button" aria-label="Weniger" className={STEPPER} disabled={multiroom === 0} onClick={() => onMultiroom(multiroom - 1)}>
            <Minus size={15} />
          </button>
          <span className="w-4 text-center text-base font-extrabold tabular-nums text-slate-900 dark:text-white">{multiroom}</span>
          <button type="button" aria-label="Mehr" className={STEPPER} disabled={multiroom === 2} onClick={() => onMultiroom(multiroom + 1)}>
            <Plus size={15} />
          </button>
        </div>
      )}
      {payTv.length > 0 && (
        <div>
          <span className={STEP_LABEL}>PayTV dazu</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {payTv.map((t) => {
              const active = selectedPayTv.includes(t.name);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onTogglePayTv(t.name)}
                  className={cn(CHIP_BASE, "shrink-0", active ? CHIP_ACTIVE : CHIP_IDLE)}
                  style={active ? { background: color } : undefined}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
