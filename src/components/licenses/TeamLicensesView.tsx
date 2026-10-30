// Benutzer, Demo-Sitzung und Lizenzen kommen aus dem Browser
"use client";

import { useProfile } from "../../hooks/useProfile";
import { canManageLicenses } from "../../lib/profile/profileRules";
import GlassPage from "../glass/GlassPage";
import LicenseManagerContent from "./LicenseManagerContent";
import MyLicense from "./MyLicense";

/**
 * Team-Lizenzierung (/subscription?licensing=true, v1 SubscriptionPage mit TeamLicensingManager).
 * Teamleiter und Admin verwalten, alle anderen sehen nur ihren eigenen Stand.
 */
export interface TeamLicensesViewProps { readonly _?: never; }

export default function TeamLicensesView() {
  const { profile } = useProfile();
  if (!profile) return null;
  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden">{canManageLicenses(profile.role) ? <LicenseManagerContent /> : <MyLicense teamId={profile.teamId} />}</div>
    </GlassPage>
  );
}
