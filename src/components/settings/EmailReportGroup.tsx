import { Clock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useEmailReport } from "../../hooks/useEmailReport";
import { useTranslation } from "../../hooks/useTranslation";
import { REPORT_TIMES, type EmailReport } from "../../lib/settings/userSettings";
import { settingsTexts } from "../../texts/settingsTexts";
import SettingsGroup from "./SettingsGroup";
import SettingsSelectRow from "./SettingsSelectRow";
import SettingsSwitchRow from "./SettingsSwitchRow";

interface EmailReportGroupProps {
  initial: EmailReport;
}

const TIME_OPTIONS = REPORT_TIMES.map((time) => ({ value: time, label: `${time} Uhr` }));

/**
 * Täglicher E-Mail-Bericht für Admin und Teamleiter (v1 AppSettings). Jede Änderung wird sofort gespeichert;
 * in v1 brauchte es einen eigenen Knopf, und das Ausschalten ging dabei verloren.
 */
export default function EmailReportGroup({ initial }: EmailReportGroupProps) {
  const { t } = useTranslation();
  const { report, setReport, save } = useEmailReport(initial);

  const change = async (next: EmailReport) => {
    setReport(next);
    if (await save(next)) toast.success(t("settings.app.emailNotificationsSaved"));
    else toast.error(t("settings.errorSaving"));
  };

  return (
    <SettingsGroup
      label={settingsTexts.groups.emailReport}
      footer={report.enabled ? t("settings.app.emailNotificationsHint").replace("{time}", report.time) : t("settings.app.emailNotificationsDescription")}
    >
      <SettingsSwitchRow icon={Mail} tone="orange" title={t("settings.app.emailNotifications")} checked={report.enabled} onChange={() => change({ ...report, enabled: !report.enabled })} />
      {report.enabled && (
        <SettingsSelectRow icon={Clock} tone="orange" title={settingsTexts.reportTime} value={report.time} options={TIME_OPTIONS} onChange={(time) => change({ ...report, time })} />
      )}
    </SettingsGroup>
  );
}
