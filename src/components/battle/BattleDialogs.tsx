import { RotateCcw, Trash2 } from "lucide-react";
import { useLastDefined } from "../../hooks/useLastDefined";
import type { BattleActions } from "../../hooks/useBattleActions";
import type { Challenge } from "../../lib/battle/battleTypes";
import { battleDialogTexts as t } from "../../texts/battleTexts";
import ConfirmDialog from "./ConfirmDialog";

/** Welche Sicherheitsabfrage gerade offen ist. */
export type BattleDialog =
  | { kind: "sick"; id: string }
  | { kind: "liftSick"; id: string; name: string }
  | { kind: "liftInactive"; id: string; name: string }
  | { kind: "reset" }
  | { kind: "cancel"; id: string }
  | null;

interface BattleDialogsProps {
  dialog: BattleDialog;
  battles: Challenge[];
  actions: BattleActions;
  onClose: () => void;
}

/** Alle Bestätigungsdialoge der Arena an einer Stelle, Texte und Farben wie in v1. */
export default function BattleDialogs({ dialog: open, battles, actions, onClose }: BattleDialogsProps) {
  // Beim Schließen bleibt der Inhalt stehen, bis der Dialog ausgeblendet ist
  const dialog = useLastDefined(open);
  const is = (kind: NonNullable<BattleDialog>["kind"]) => open?.kind === kind;
  const confirm = (run: () => Promise<unknown>) => async () => {
    await run();
    onClose();
  };
  const cancelled = dialog?.kind === "cancel" ? battles.find((b) => b.id === dialog.id) : undefined;
  return (
    <>
      <ConfirmDialog open={is("sick")} emoji="🤒" title={t.sickTitle} confirmLabel={t.sickConfirm} tone="red"
        busy={dialog?.kind === "sick" && actions.isBusy(`sick:${dialog.id}`)}
        onConfirm={dialog?.kind === "sick" ? confirm(() => actions.reportSick(dialog.id)) : onClose} onClose={onClose}>
        {t.sickBody}
      </ConfirmDialog>
      <ConfirmDialog open={is("liftSick")} emoji="🩹" title={t.liftSickTitle} confirmLabel={t.liftConfirm} tone="amber"
        busy={dialog?.kind === "liftSick" && actions.isBusy(`liftSick:${dialog.id}`)}
        onConfirm={dialog?.kind === "liftSick" ? confirm(() => actions.removeSick(dialog.id)) : onClose} onClose={onClose}>
        {t.liftSickBody(dialog?.kind === "liftSick" ? dialog.name : "")}
      </ConfirmDialog>
      <ConfirmDialog open={is("liftInactive")} emoji="⚡" title={t.liftInactiveTitle} confirmLabel={t.liftConfirm} tone="gray"
        busy={dialog?.kind === "liftInactive" && actions.isBusy(`liftInactive:${dialog.id}`)}
        onConfirm={dialog?.kind === "liftInactive" ? confirm(() => actions.removeInactive(dialog.id)) : onClose} onClose={onClose}>
        {t.liftInactiveBody(dialog?.kind === "liftInactive" ? dialog.name : "")}
      </ConfirmDialog>
      <ConfirmDialog open={is("reset")} emoji="🔄" title={t.resetTitle} confirmLabel={t.resetConfirm} tone="orange"
        confirmIcon={<RotateCcw className="h-4 w-4" />} busy={actions.isBusy("reset")}
        onConfirm={confirm(actions.resetStreaks)} onClose={onClose}>
        {t.resetBody}
      </ConfirmDialog>
      <ConfirmDialog open={is("cancel")} emoji="🗑️" title={t.cancelTitle} confirmLabel={t.cancelConfirm} tone="red"
        confirmIcon={<Trash2 className="h-4 w-4" />} busy={dialog?.kind === "cancel" && actions.isBusy(`cancel:${dialog.id}`)}
        onConfirm={dialog?.kind === "cancel" ? confirm(() => actions.cancel(dialog.id)) : onClose} onClose={onClose}>
        {t.cancelBody(cancelled ? `${cancelled.challengerName} vs ${cancelled.opponentName}` : undefined)}
      </ConfirmDialog>
    </>
  );
}
