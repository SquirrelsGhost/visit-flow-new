import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useLicenseSheets } from "../../hooks/useLicenseSheets";
import type { TeamLicenseActions } from "../../hooks/useTeamLicenses";
import { openBillingPortal } from "../../lib/licenses/licenseApi";
import { seatRows } from "../../lib/licenses/licenseLogic";
import type { SeatRow, TeamLicenses } from "../../lib/licenses/licenseTypes";
import GlassBody from "../glass/GlassBody";
import GlassSplit from "../glass/GlassSplit";
import BillingSection from "./BillingSection";
import ContractNotice from "./ContractNotice";
import LicenseHero from "./LicenseHero";
import LicenseQuickActions from "./LicenseQuickActions";
import LicenseSheets from "./LicenseSheets";
import MemberSection from "./MemberSection";
import PartnerSection from "./PartnerSection";

interface LicenseManagerProps {
  data: TeamLicenses;
  busy: boolean;
  actions: TeamLicenseActions;
}

/** Aus dem Profil ("Lizenz hinzufügen") kommt ?add=1: dann startet "Lizenzen anpassen" mit einer mehr. */
const wantsAdd = () => new URLSearchParams(window.location.search).get("add") === "1";

async function goToPortal() {
  const result = await openBillingPortal();
  if (result.url) window.location.href = result.url;
  else toast.error(result.message);
}

/**
 * Team-Lizenzierung für Teamleiter und Admin: Kopf mit Belegung und Kosten, Schnellaktionen,
 * Sondertarif, Mitglieder, Partner und Abrechnung. Jede Änderung läuft über ein Sheet.
 */
export default function LicenseManager({ data, busy, actions }: LicenseManagerProps) {
  const sheets = useLicenseSheets();
  const rows = useMemo(() => seatRows(data), [data]);
  const { show } = sheets;
  const addOne = () => show({ kind: "count", start: data.licenseCount + 1 });

  useEffect(() => {
    if (wantsAdd()) show({ kind: "count", start: data.licenseCount + 1 });
    // nur beim ersten Anzeigen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRow = (row: SeatRow) => (row.kind === "free" ? show({ kind: "assign" }) : show({ kind: "member", row }));

  return (
    <GlassBody layout="wide">
      <GlassSplit
        sticky
        aside={
          <>
            <LicenseHero data={data} />
            <LicenseQuickActions busy={busy} onAdd={addOne} onAssign={() => show({ kind: "assign" })} onInvoices={() => show({ kind: "invoices" })} onPayment={() => void goToPortal()} />
          </>
        }
      >
        {data.contract && <ContractNotice contract={data.contract} licenseCount={data.licenseCount} />}
        <MemberSection rows={rows} onOpen={openRow} />
        <PartnerSection data={data} onAdd={() => show({ kind: "partnerAdd" })} onOpen={(email) => show({ kind: "partner", email })} />
        <BillingSection data={data} onCount={() => show({ kind: "count", start: data.licenseCount })} onInvoices={() => show({ kind: "invoices" })} onPortal={() => void goToPortal()} />
      </GlassSplit>
      <LicenseSheets sheets={sheets} data={data} busy={busy} actions={actions} />
    </GlassBody>
  );
}
