import type { AbrechnungItem } from "../../lib/abrechnung/abrechnungTypes";
import { useLastDefined } from "../../hooks/useLastDefined";
import Modal from "../ui/Modal";
import ClaimForm from "./ClaimForm";

interface ClaimDialogProps {
  items: AbrechnungItem[] | null;
  onClose: () => void;
  onSubmit: (items: AbrechnungItem[], reason: string, note: string) => void;
}

/** Reklamation für eine oder mehrere Positionen (v1): Grund als Chips, optionale Notiz. */
export default function ClaimDialog({ items, onClose, onSubmit }: ClaimDialogProps) {
  // Inhalt bleibt beim Ausblenden stehen
  const shown = useLastDefined(items);
  return (
    <Modal open={!!items} onClose={onClose} labelledBy="abr-claim-title" className="max-w-md">
      {shown && <ClaimForm key={shown.map((i) => i._id).join()} items={shown} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}
