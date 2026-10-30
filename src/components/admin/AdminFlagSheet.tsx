import { Info, TriangleAlert } from "lucide-react";
import type { SystemFlag } from "../../lib/admin/adminTypes";
import { adminTexts } from "../../texts/adminTexts";
import GlassSheet from "../glass/GlassSheet";
import SheetButton from "../licenses/sheets/SheetButton";
import SheetNote from "../licenses/sheets/SheetNote";

interface AdminFlagSheetProps {
  /** Schalter, der gerade bestätigt wird; null = geschlossen. */
  flag: SystemFlag | null;
  /** Aktueller Zustand des Schalters (vor dem Wechsel). */
  on: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const texts = adminTexts.system;
/** Wechsel, die Nutzer aussperren oder Schutz lockern, stehen als Warnung da (v1 dialogType danger/warning). */
const RISKY = (flag: SystemFlag, turningOn: boolean) => (flag === "allowRegistration" ? !turningOn : turningOn);

/** Rückfrage vor einem Systemschalter wie in v1, weil die Änderung sofort für alle Nutzer gilt. */
export default function AdminFlagSheet({ flag, on, onClose, onConfirm }: AdminFlagSheetProps) {
  const turningOn = !on;
  const risky = flag ? RISKY(flag, turningOn) : false;
  return (
    <GlassSheet open={flag !== null} onClose={onClose} title={flag ? texts.flags[flag].title : ""} subtitle={flag ? texts.flags[flag].text : undefined}>
      {flag && (
        <SheetNote icon={risky ? TriangleAlert : Info} tone={risky ? "warn" : "info"}>
          {turningOn ? texts.confirm[flag].on : texts.confirm[flag].off}
        </SheetNote>
      )}
      <SheetButton label={turningOn ? texts.turnOn : texts.turnOff} variant={risky ? "danger" : "primary"} onClick={onConfirm} />
      <SheetButton label={texts.cancel} variant="secondary" onClick={onClose} />
    </GlassSheet>
  );
}
