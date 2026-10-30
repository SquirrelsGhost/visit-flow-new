import { LICENSES } from "../onboarding/licenses";
import type { LicenseMember, TeamLicenses } from "./licenseTypes";

const KEY = "vf_licenses_demo";

const member = (email: string, name: string | null, registered = true, active = true, paying = false): LicenseMember => ({ email, name, registered, active, paying });

/** Bekannte Konten der Demo; neu eingetragene Adressen gelten als Einladung offen. */
const DEMO_ACCOUNTS: readonly LicenseMember[] = [
  member("lena.wagner@team-mitte.de", "Lena Wagner"),
  member("jonas.becker@team-mitte.de", "Jonas Becker"),
  member("sara.yilmaz@team-mitte.de", "Sara Yılmaz"),
  member("tim.hoffmann@team-mitte.de", "Tim Hoffmann"),
  member("mia.schulz@team-mitte.de", "Mia Schulz"),
  member("david.klein@team-mitte.de", "David Klein"),
  member("noah.richter@team-mitte.de", "Noah Richter", true, false),
  member("aylin.demir@partner-mail.de", "Aylin Demir", true, true, true),
  member("felix.braun@partner-mail.de", "Felix Braun", true, true, false),
];

const nextMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();

function initial(): TeamLicenses {
  return {
    teamName: "Team Berlin Mitte",
    licenseCount: 10,
    minLicenses: LICENSES.min,
    licensedEmails: [...DEMO_ACCOUNTS.slice(0, 7).map((m) => m.email), "kim.weber@gmail.com"],
    members: [],
    partnerEmails: ["aylin.demir@partner-mail.de", "felix.braun@partner-mail.de", "ole.jansen@web.de"],
    partners: [],
    status: "active",
    renewsAt: nextMonthStart(),
    contract: { minLicenses: 15, startMonth: 3, currentMonth: 2, breached: false },
    creditRate: 0,
    referralCode: "MITTE-65",
    demo: true,
  };
}

const lookup = (emails: readonly string[]): LicenseMember[] =>
  emails.map((email) => DEMO_ACCOUNTS.find((a) => a.email === email) ?? member(email, null, false, false));

/** Zieht Personen zu den E-Mails, wie es der v1-Server mit members/referredMembers tut. */
function resolve(data: TeamLicenses): TeamLicenses {
  return { ...data, members: lookup(data.licensedEmails), partners: lookup(data.partnerEmails) };
}

/** Demo-Stand: bleibt wie die Demo-Sitzung bis zum Schließen des Tabs. */
export function readDemoLicenses(): TeamLicenses {
  try {
    const saved = window.sessionStorage.getItem(KEY);
    if (saved) return resolve({ ...initial(), ...(JSON.parse(saved) as Partial<TeamLicenses>), demo: true });
  } catch {
    // fällt auf den Anfangsstand zurück
  }
  return resolve(initial());
}

export function writeDemoLicenses(patch: Pick<Partial<TeamLicenses>, "licenseCount" | "licensedEmails" | "partnerEmails">): TeamLicenses {
  const next = { ...readDemoLicenses(), ...patch };
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ licenseCount: next.licenseCount, licensedEmails: next.licensedEmails, partnerEmails: next.partnerEmails }));
  } catch {
    // gilt dann nur bis zum Neuladen
  }
  return resolve(next);
}
