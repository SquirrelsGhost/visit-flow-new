import { Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON } from "../glass/glassStyles";

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  text: string;
  confirm: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Sicherheitsfrage vor einem Schritt, der sich nicht rückgängig machen lässt. */
export default function ConfirmSheet({ open, title, text, confirm, onConfirm, onClose }: ConfirmSheetProps) {
  return (
    <GlassSheet open={open} onClose={onClose} title={title} subtitle={text}>
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="glass-surface h-12 flex-1 rounded-2xl text-sm font-semibold text-foreground">
          {streetListTexts.cancel}
        </button>
        <button type="button" onClick={onConfirm} className={cn(GLASS_BUTTON, "flex-1")}>
          <Trash2 aria-hidden className="h-4 w-4" /> {confirm}
        </button>
      </div>
    </GlassSheet>
  );
}
