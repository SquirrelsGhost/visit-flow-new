import { useCallback, useState } from "react";
import type { SeatRow } from "../lib/licenses/licenseTypes";

type MemberRow = Extract<SeatRow, { kind: "member" }>;

export type LicenseSheet =
  | { kind: "count"; start: number }
  | { kind: "assign" }
  | { kind: "member"; row: MemberRow }
  | { kind: "partnerAdd" }
  | { kind: "partner"; email: string }
  | { kind: "invoices" };

export interface LicenseSheets {
  /** Zuletzt geöffnetes Sheet; bleibt beim Schließen stehen, damit es mit Inhalt hinausgleitet. */
  sheet: LicenseSheet | null;
  open: boolean;
  /** Wechselt bei jedem Öffnen, damit Formulare frisch starten. */
  key: number;
  show: (sheet: LicenseSheet) => void;
  close: () => void;
  isOpen: (kind: LicenseSheet["kind"]) => boolean;
}

/** Welches Aktions-Sheet der Lizenzseite gerade offen ist. */
export function useLicenseSheets(): LicenseSheets {
  const [sheet, setSheet] = useState<LicenseSheet | null>(null);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  const show = useCallback((next: LicenseSheet) => {
    setSheet(next);
    setKey((k) => k + 1);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const isOpen = (kind: LicenseSheet["kind"]) => open && sheet?.kind === kind;

  return { sheet, open, key, show, close, isOpen };
}
