import { Bell } from "lucide-react";
import { toast } from "sonner";
import { usePushPermission } from "../../hooks/usePushPermission";
import { useTranslation } from "../../hooks/useTranslation";
import { deviceKind, isIosSafari, showNotification } from "../../lib/settings/pushPermission";
import type { TranslationKey } from "../../texts/i18n/de";
import SettingsSwitchRow from "./SettingsSwitchRow";

interface PushRowProps {
  enabled: boolean;
  leadMinutes: number;
  onChange: (enabled: boolean) => void;
}

const HELP: Record<ReturnType<typeof deviceKind>, TranslationKey> = {
  ios: "settings.app.pushBlockedIos",
  android: "settings.app.pushBlockedAndroid",
  desktop: "settings.app.pushBlockedDesktop",
};

/**
 * Push-Benachrichtigungen (v1 AppSettings): fragt die Browser-Erlaubnis an und erklärt bei einer Sperre,
 * wie man sie aufhebt. An ist der Schalter nur, wenn der Browser erlaubt und der Benutzer es will.
 */
export default function PushRow({ enabled, leadMinutes, onChange }: PushRowProps) {
  const { t } = useTranslation();
  const [permission, request] = usePushPermission();
  const active = permission === "granted" && enabled;
  const blocked = permission === "denied";

  const showHelp = () => toast.info(t("settings.app.pushBlockedHow"), { description: t(HELP[deviceKind()]), duration: 15000 });

  const toggle = async () => {
    if (active) {
      onChange(false);
      toast.success(t("settings.app.pushNotificationsDisabled"));
      return;
    }
    if (blocked) return showHelp();
    const next = await request();
    if (next !== "granted") {
      onChange(false);
      toast.error(t("settings.app.pushBlockedTitle"), {
        description: t(next === "unsupported" && isIosSafari() ? "settings.app.pushNotificationsIosHint" : "settings.app.pushBlockedDescription"),
        duration: 10000,
        action: { label: t("settings.app.pushBlockedHelp"), onClick: showHelp },
      });
      return;
    }
    onChange(true);
    toast.success(t("settings.app.pushNotificationsEnabled"));
    showNotification(t("settings.app.pushNotificationsEnabled"), t("settings.app.pushNotificationsMessage").replace("{minutes}", String(leadMinutes || 15)));
  };

  const subtitle = blocked
    ? `${t("settings.app.pushBlockedInBrowser")} · ${t("settings.app.pushBlockedTapHelp")}`
    : active && isIosSafari()
      ? t("settings.app.pushNotificationsIosHint")
      : t("settings.app.pushNotificationsDescription");

  return <SettingsSwitchRow icon={Bell} tone="red" title={t("settings.app.pushNotifications")} subtitle={subtitle} warn={blocked} checked={active} onChange={toggle} />;
}
