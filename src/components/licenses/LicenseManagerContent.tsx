import { useTeamLicenses } from "../../hooks/useTeamLicenses";
import LicenseError from "./LicenseError";
import LicenseManager from "./LicenseManager";
import LicenseSkeleton from "./LicenseSkeleton";

/** Lädt die Team-Lizenzen (nur für Teamleiter und Admin) und zeigt Platzhalter, Fehler oder die Verwaltung. */
export interface LicenseManagerContentProps { readonly _?: never; }

export default function LicenseManagerContent() {
  const { data, busy, reload, actions } = useTeamLicenses();
  if (data === undefined) return <LicenseSkeleton />;
  if (data === null) return <LicenseError onRetry={reload} />;
  return <LicenseManager data={data} busy={busy} actions={actions} />;
}
