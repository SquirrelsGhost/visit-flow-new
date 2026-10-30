import { apiRequest } from "../apiClient";
import { hasDemoSession } from "../auth/demoSession";
import { readSettings, updateSettings } from "./settingsStore";
import type { EmailReport } from "./userSettings";

const PATH = "/settings/email-notifications";

interface EmailReportBody {
  settings?: Partial<EmailReport>;
}

/** v1 antwortet mit { success, settings }, v2 mit { success, data: { settings } }. */
function pickSettings(body: unknown): Partial<EmailReport> | undefined {
  const value = body as EmailReportBody & { data?: EmailReportBody };
  return value.data?.settings ?? value.settings;
}

/** Täglicher Bericht vom Server (v1-Endpunkt). In der Demo und ohne Antwort gilt der lokale Stand. */
export async function loadEmailReport(): Promise<EmailReport> {
  const local = readSettings().emailReport;
  if (hasDemoSession()) return local;
  const response = await apiRequest<EmailReportBody>(PATH, { cache: "no-cache" });
  const remote = response.success ? pickSettings(response) : undefined;
  if (!remote) return local;
  return { enabled: remote.enabled ?? false, time: remote.time ?? local.time };
}

/** Speichert den Bericht; true bei Erfolg. Die Demo speichert nur lokal. */
export async function saveEmailReport(report: EmailReport): Promise<boolean> {
  updateSettings({ emailReport: report });
  if (hasDemoSession()) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return true;
  }
  const response = await apiRequest<unknown>(PATH, { method: "POST", body: JSON.stringify(report) });
  return response.success;
}
