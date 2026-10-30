import { apiRequest } from "../apiClient";
import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, messageOf } from "../battle/legacyRequest";
import { demoDelay } from "../profile/profileDemoData";
import { licenseTexts } from "../../texts/licenseTexts";
import { readDemoLicenses, writeDemoLicenses } from "./licenseDemoData";
import { normalizeTeamLicenses } from "./licenseNormalize";
import type { LicenseResult, TeamLicenses } from "./licenseTypes";

/**
 * Endpunkte der v1-API wie im TeamLicensingManager, Namen unverändert:
 * GET /teams/my-team/licenses, POST …/licenses/update und …/licenses/update-referred,
 * POST /subscriptions/portal. Im Demo-Modus antwortet ein Stand im sessionStorage.
 */
export async function loadTeamLicenses(): Promise<TeamLicenses | null> {
  if (hasDemoSession()) return demoDelay().then(readDemoLicenses);
  const response = await apiRequest<unknown>("/teams/my-team/licenses?preview=true");
  return response.success ? normalizeTeamLicenses(response.data) : null;
}

const failed = (body: { message?: string; error?: string; success: boolean }) => messageOf(body) || licenseTexts.errors.save;

/** Bezahlte Plätze und ihre E-Mails; Stripe skaliert das Abo ab dem nächsten Abrechnungsmonat. */
export async function saveLicenses(licenseCount: number, emails: readonly string[]): Promise<LicenseResult> {
  if (hasDemoSession()) {
    await demoDelay();
    writeDemoLicenses({ licenseCount, licensedEmails: [...emails] });
    return { ok: true };
  }
  const body = await legacyRequest("/teams/my-team/licenses/update", json("POST", { licenseCount, emails }));
  return body.success ? { ok: true } : { ok: false, message: failed(body) };
}

/** Selbstzahlende Partner, die über das Team eingetragen sind. */
export async function savePartners(emails: readonly string[]): Promise<LicenseResult> {
  if (hasDemoSession()) {
    await demoDelay();
    writeDemoLicenses({ partnerEmails: [...emails] });
    return { ok: true };
  }
  const body = await legacyRequest("/teams/my-team/licenses/update-referred", json("POST", { emails }));
  return body.success ? { ok: true } : { ok: false, message: failed(body) };
}

/** Stripe-Kundenportal für Zahlungsmittel; liefert die Adresse oder eine Meldung. */
export async function openBillingPortal(): Promise<LicenseResult & { url?: string }> {
  if (hasDemoSession()) return demoDelay().then(() => ({ ok: false, message: licenseTexts.errors.portalDemo }));
  const response = await apiRequest<{ url?: string }>("/subscriptions/portal", json("POST", { returnUrl: window.location.href }));
  const url = response.success ? response.data.url : undefined;
  return url ? { ok: true, url } : { ok: false, message: licenseTexts.errors.portal };
}
