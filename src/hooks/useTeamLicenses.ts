import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { loadTeamLicenses, saveLicenses, savePartners } from "../lib/licenses/licenseApi";
import { replaceEmail, withEmail, withoutEmail } from "../lib/licenses/licenseLogic";
import type { LicenseResult, TeamLicenses } from "../lib/licenses/licenseTypes";
import { licenseTexts } from "../texts/licenseTexts";
import { fill } from "../texts/profileTexts";

const texts = licenseTexts.sheets;

export interface TeamLicenseActions {
  setCount: (count: number) => Promise<boolean>;
  /** Weist eine E-Mail zu; ohne freien Platz wird eine Lizenz dazugebucht. */
  assign: (email: string) => Promise<boolean>;
  revoke: (email: string) => Promise<boolean>;
  replace: (from: string, to: string) => Promise<boolean>;
  addPartner: (email: string) => Promise<boolean>;
  removePartner: (email: string) => Promise<boolean>;
}

export interface TeamLicenseState {
  /** undefined = lädt, null = Fehler. */
  data: TeamLicenses | null | undefined;
  busy: boolean;
  reload: () => void;
  actions: TeamLicenseActions;
}

/**
 * Lädt die Team-Lizenzen und speichert jede Aktion sofort (v1 sammelte Änderungen und hatte eine
 * Speichern-Leiste). Nach dem Speichern wird neu geladen, damit Status und Personen vom Server kommen.
 * Mit enabled = false lädt nichts (z. B. Strukturleiter auf der Seite Meine Teams).
 */
export function useTeamLicenses(enabled = true): TeamLicenseState {
  const [data, setData] = useState<TeamLicenses | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    void loadTeamLicenses().then((next) => alive && setData(next));
    return () => {
      alive = false;
    };
  }, [version, enabled]);

  const reload = useCallback(() => {
    setData(undefined);
    setVersion((v) => v + 1);
  }, []);

  const run = useCallback(async (save: () => Promise<LicenseResult>, success: string) => {
    setBusy(true);
    const result = await save();
    if (result.ok) {
      setData(await loadTeamLicenses());
      toast.success(success);
    } else toast.error(result.message);
    setBusy(false);
    return result.ok;
  }, []);

  const current = data ?? null;
  const emails = current?.licensedEmails ?? [];
  const count = current?.licenseCount ?? 0;
  const partners = current?.partnerEmails ?? [];

  const actions: TeamLicenseActions = {
    setCount: (next) => run(() => saveLicenses(next, emails), fill(texts.count.done, { count: next })),
    assign: (email) => run(() => saveLicenses(Math.max(count, emails.length + 1), withEmail(emails, email)), fill(texts.assign.done, { email: email.trim().toLowerCase() })),
    revoke: (email) => run(() => saveLicenses(count, withoutEmail(emails, email)), texts.member.revoked),
    replace: (from, to) => run(() => saveLicenses(count, replaceEmail(emails, from, to)), texts.member.changed),
    addPartner: (email) => run(() => savePartners(withEmail(partners, email)), texts.partner.done),
    removePartner: (email) => run(() => savePartners(withoutEmail(partners, email)), texts.partner.removed),
  };

  return { data, busy, reload, actions };
}
