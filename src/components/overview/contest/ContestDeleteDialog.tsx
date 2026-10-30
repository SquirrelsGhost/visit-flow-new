import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";
import ConfirmDialog from "../../profile/ConfirmDialog";

interface ContestDeleteDialogProps {
  name: string;
  open: boolean;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const texts = overviewTexts.contest;

/** Rückfrage vor dem Löschen; das Gewinnspiel verschwindet für alle Teilnehmer. */
export default function ContestDeleteDialog({ name, open, busy, onConfirm, onClose }: ContestDeleteDialogProps) {
  return (
    <ConfirmDialog open={open} title={texts.deleteTitle} confirmLabel={texts.delete} cancelLabel={texts.cancel} busy={busy} onConfirm={onConfirm} onClose={onClose}>
      {fill(texts.deleteBody, { name })}
    </ConfirmDialog>
  );
}
