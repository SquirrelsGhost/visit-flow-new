import type { TeamLicenseActions } from "../../hooks/useTeamLicenses";
import type { LicenseSheets as Sheets } from "../../hooks/useLicenseSheets";
import type { TeamLicenses } from "../../lib/licenses/licenseTypes";
import InvoicesDialog from "../profile/InvoicesDialog";
import AssignSheet from "./sheets/AssignSheet";
import CountSheet from "./sheets/CountSheet";
import MemberSheet from "./sheets/MemberSheet";
import PartnerAddSheet from "./sheets/PartnerAddSheet";
import PartnerSheet from "./sheets/PartnerSheet";

interface LicenseSheetsProps {
  sheets: Sheets;
  data: TeamLicenses;
  busy: boolean;
  actions: TeamLicenseActions;
}

/** Alle Aktions-Sheets der Seite; immer eingehängt, damit sie weich herein- und hinausgleiten. */
export default function LicenseSheets({ sheets, data, busy, actions }: LicenseSheetsProps) {
  const { sheet, key, close, isOpen } = sheets;
  const shared = { data, busy, onClose: close };
  return (
    <>
      <CountSheet key={`count-${key}`} open={isOpen("count")} start={sheet?.kind === "count" ? sheet.start : data.licenseCount} onSave={actions.setCount} {...shared} />
      <AssignSheet key={`assign-${key}`} open={isOpen("assign")} onAssign={actions.assign} {...shared} />
      <MemberSheet key={`member-${key}`} open={isOpen("member")} row={sheet?.kind === "member" ? sheet.row : null} onReplace={actions.replace} onRevoke={actions.revoke} {...shared} />
      <PartnerAddSheet key={`partner-add-${key}`} open={isOpen("partnerAdd")} onAdd={actions.addPartner} {...shared} />
      <PartnerSheet open={isOpen("partner")} email={sheet?.kind === "partner" ? sheet.email : null} onRemove={actions.removePartner} {...shared} />
      <InvoicesDialog open={isOpen("invoices")} onClose={close} />
    </>
  );
}
