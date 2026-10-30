import { useCallback, useEffect, useState } from "react";
import { loadEmailReport, saveEmailReport } from "../lib/settings/emailReportApi";
import type { EmailReport } from "../lib/settings/userSettings";

export interface EmailReportState {
  report: EmailReport;
  setReport: (report: EmailReport) => void;
  save: (report: EmailReport) => Promise<boolean>;
}

/** Täglicher E-Mail-Bericht: lädt den Stand vom Server (oder lokal) und speichert jede Änderung. */
export function useEmailReport(initial: EmailReport): EmailReportState {
  const [report, setReport] = useState<EmailReport>(initial);

  useEffect(() => {
    let active = true;
    void loadEmailReport().then((loaded) => active && setReport(loaded));
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback((next: EmailReport) => saveEmailReport(next), []);

  return { report, setReport, save };
}
