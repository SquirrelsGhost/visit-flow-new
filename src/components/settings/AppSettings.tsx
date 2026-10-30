import { BellRing, Globe, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "../../hooks/useTranslation";
import { useUserSettings } from "../../hooks/useUserSettings";
import type { Language } from "../../lib/i18n/translationContext";
import { LEAD_MINUTES } from "../../lib/settings/userSettings";
import type { TranslationKey } from "../../texts/i18n/de";
import { settingsTexts } from "../../texts/settingsTexts";
import EmailReportGroup from "./EmailReportGroup";
import FeedbackSettingsGroup from "./FeedbackSettingsGroup";
import PushRow from "./PushRow";
import SettingsGroup from "./SettingsGroup";
import SettingsSelectRow from "./SettingsSelectRow";
import SettingsSwitchRow from "./SettingsSwitchRow";
import SettingsTabBody from "./SettingsTabBody";

const LEAD_LABELS: Record<(typeof LEAD_MINUTES)[number], TranslationKey> = {
  0: "settings.app.notificationLeadOff",
  5: "settings.app.notificationLead5",
  10: "settings.app.notificationLead10",
  15: "settings.app.notificationLead15",
  30: "settings.app.notificationLead30",
};

/** Den E-Mail-Bericht stellen in v1 nur Admin und Teamleiter ein. */
const REPORT_ROLES = ["admin", "teamleiter"];

/** Reiter App (v1 AppSettings), geordnet nach Allgemein, Benachrichtigungen und E-Mail-Bericht. */
export interface AppSettingsProps { readonly _?: never; }

export default function AppSettings() {
  const { t, language, setLanguage } = useTranslation();
  const { user } = useAuth();
  const { settings, update } = useUserSettings();

  const changeLanguage = (value: string) => {
    const next: Language = value === "en" ? "en" : "de";
    setLanguage(next);
    toast.success(t("settings.languageChanged").replace("{language}", t(next === "de" ? "settings.german" : "settings.english")));
  };

  return (
    <SettingsTabBody>
      <SettingsGroup label={settingsTexts.groups.general}>
        <SettingsSelectRow
          icon={Globe}
          tone="blue"
          title={t("settings.language")}
          value={language}
          options={[
            { value: "de", label: t("settings.german") },
            { value: "en", label: t("settings.english") },
          ]}
          onChange={changeLanguage}
        />
      </SettingsGroup>
      <FeedbackSettingsGroup />
      <SettingsGroup label={t("settings.app.notifications")} footer={t("settings.app.notificationLeadDescription")}>
        <PushRow enabled={settings.pushNotifications} leadMinutes={settings.notificationLeadMinutes} onChange={(pushNotifications) => update({ pushNotifications })} />
        <SettingsSwitchRow
          icon={Volume2}
          tone="purple"
          title={t("settings.app.soundNotifications")}
          subtitle={t("settings.app.soundNotificationsDescription")}
          checked={settings.soundNotifications}
          onChange={() => update({ soundNotifications: !settings.soundNotifications })}
        />
        <SettingsSelectRow
          icon={BellRing}
          tone="rose"
          title={settingsTexts.leadTitle}
          value={String(settings.notificationLeadMinutes)}
          options={LEAD_MINUTES.map((minutes) => ({ value: String(minutes), label: t(LEAD_LABELS[minutes]) }))}
          onChange={(value) => update({ notificationLeadMinutes: Number(value) })}
        />
      </SettingsGroup>
      {user && REPORT_ROLES.includes(user.role) && <EmailReportGroup initial={settings.emailReport} />}
    </SettingsTabBody>
  );
}
