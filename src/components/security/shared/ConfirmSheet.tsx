import { Info, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import GlassSheet from "../../glass/GlassSheet";
import SheetButton from "../../licenses/sheets/SheetButton";
import SheetNote from "../../licenses/sheets/SheetNote";

/** Eine Rückfrage vor einer Aktion: Titel, Erklärung, Knopf; die Aktion meldet true, wenn das Sheet schließen darf. */
export interface SecurityConfirm {
  title: string;
  text: string;
  label: string;
  /** Schreibende Aktion mit Folgen (Löschen, Entsperren eines Angreifers): roter Warnknopf. */
  danger?: boolean;
  run: () => Promise<boolean>;
}

interface ConfirmSheetProps {
  confirm: SecurityConfirm | null;
  onClose: () => void;
}

/** Rückfrage wie die v1-Dialoge (Entsperren, Entfernen, Löschen), als Glas-Sheet. */
export default function ConfirmSheet({ confirm, onClose }: ConfirmSheetProps) {
  const t = useSecurityTexts();
  const [busy, setBusy] = useState(false);
  return (
    <GlassSheet open={confirm !== null} onClose={onClose} title={confirm?.title ?? ""}>
      {confirm && (
        <SheetNote icon={confirm.danger ? TriangleAlert : Info} tone={confirm.danger ? "warn" : "info"}>
          {confirm.text}
        </SheetNote>
      )}
      <SheetButton
        label={confirm?.label ?? ""}
        busyLabel={t.busy}
        busy={busy}
        variant={confirm?.danger ? "danger" : "primary"}
        onClick={async () => {
          if (!confirm || busy) return;
          setBusy(true);
          const ok = await confirm.run();
          setBusy(false);
          if (ok) onClose();
        }}
      />
      <SheetButton label={t.cancel} variant="secondary" onClick={onClose} />
    </GlassSheet>
  );
}
