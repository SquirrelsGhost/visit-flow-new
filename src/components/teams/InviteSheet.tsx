import type { TeamLicenseState } from "../../hooks/useTeamLicenses";
import AssignSheet from "../licenses/sheets/AssignSheet";

interface InviteSheetProps {
  open: boolean;
  licenses: TeamLicenseState;
  onClose: () => void;
}

/** Neue Person einladen = Lizenz an ihre E-Mail vergeben, genau wie auf der Lizenzseite (v1 Team-Lizenzen). */
export default function InviteSheet({ open, licenses, onClose }: InviteSheetProps) {
  if (!licenses.data) return null;
  return <AssignSheet open={open} data={licenses.data} busy={licenses.busy} onClose={onClose} onAssign={licenses.actions.assign} />;
}
