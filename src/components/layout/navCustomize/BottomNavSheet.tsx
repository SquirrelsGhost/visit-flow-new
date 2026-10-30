// Sheet mit Auswahl und Zurücksetzen braucht Zustand und Klicks
"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "../../../hooks/useTranslation";
import { hapticFeedback } from "../../../lib/device/haptics";
import type { NavTarget } from "../../../lib/navigation/navTargets";
import { bottomNavTexts as texts } from "../../../texts/bottomNavTexts";
import GlassSheet from "../../glass/GlassSheet";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_FOOTER, GLASS_LABEL } from "../../glass/glassStyles";
import NavSlotPicker from "./NavSlotPicker";
import NavTargetOption from "./NavTargetOption";

interface BottomNavSheetProps {
  /** Bearbeiteter Platz; null = geschlossen. */
  slot: number | null;
  slots: readonly NavTarget[];
  options: readonly NavTarget[];
  customized: boolean;
  onSlotChange: (slot: number) => void;
  onChoose: (slot: number, targetId: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const RESET =
  "glass-surface flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-foreground transition-[background-color,transform,opacity] duration-200 hover:bg-[var(--glass-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none";

/** Langes Drücken auf einen Platz öffnet dieses Sheet: Platz wählen, Seite wählen, fertig. Belegte Seiten tauschen den Platz. */
export default function BottomNavSheet({ slot, slots, options, customized, onSlotChange, onChoose, onReset, onClose }: BottomNavSheetProps) {
  const { t } = useTranslation();
  const editing = slot ?? 0;
  const currentId = slots[editing]?.id;

  const subtitleFor = (target: NavTarget) => {
    if (target.id === currentId) return texts.current;
    const other = slots.findIndex((s) => s.id === target.id);
    return other >= 0 ? texts.swapWith(texts.slotNames[other] ?? String(other + 1)) : texts.free;
  };
  const choose = (target: NavTarget) => {
    hapticFeedback("light");
    if (target.id !== currentId) onChoose(editing, target.id);
    onClose();
  };
  const reset = () => {
    hapticFeedback("medium");
    onReset();
    toast.success(texts.resetDone);
    onClose();
  };

  return (
    <GlassSheet open={slot !== null} onClose={onClose} title={texts.sheetTitle} subtitle={texts.sheetSubtitle}>
      <div>
        <p className={GLASS_LABEL}>{texts.slotsLabel}</p>
        <NavSlotPicker slots={slots} selected={editing} onSelect={onSlotChange} />
      </div>
      <div>
        <p className={GLASS_LABEL}>{texts.optionsLabel}</p>
        <div role="radiogroup" aria-label={texts.optionsLabel} className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
          {options.map((target) => (
            <NavTargetOption
              key={target.id}
              target={target}
              label={t(target.labelKey)}
              subtitle={subtitleFor(target)}
              current={target.id === currentId}
              onChoose={() => choose(target)}
            />
          ))}
        </div>
      </div>
      <div>
        <button type="button" onClick={reset} disabled={!customized} className={RESET}>
          <RotateCcw aria-hidden className="h-4 w-4" />
          {texts.reset}
        </button>
        <p className={GLASS_FOOTER}>{texts.savedHint}</p>
      </div>
    </GlassSheet>
  );
}
