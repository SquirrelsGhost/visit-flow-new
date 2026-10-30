import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useStorageUsage } from "../../hooks/useStorageUsage";
import { useTranslation } from "../../hooks/useTranslation";
import { useUserSettings } from "../../hooks/useUserSettings";
import { downloadSettings } from "../../lib/settings/exportSettings";
import { settingsTexts } from "../../texts/settingsTexts";
import CloudUsage from "./CloudUsage";
import SettingsGroup from "./SettingsGroup";
import SettingsRow from "./SettingsRow";
import SettingsTabBody from "./SettingsTabBody";

/** Reiter Speicher (v1 StorageSettings): User-Cloud mit Belegung und Sync, darunter der Export der eigenen Daten. */
export interface StorageSettingsProps { readonly _?: never; }

export default function StorageSettings() {
  const { t } = useTranslation();
  const { settings } = useUserSettings();
  const { usage, syncing, lastSync, sync } = useStorageUsage();

  const runSync = async () => {
    if (syncing) return;
    if (await sync()) toast.success(t("settings.storage.syncSuccess").replace("{action}", settingsTexts.demoAction));
    else toast.info(settingsTexts.cloudLocal);
  };

  const exportSettings = () => {
    try {
      downloadSettings(settings);
      toast.success(t("settings.storage.exportSuccess"));
    } catch {
      toast.error(t("settings.storage.exportError"));
    }
  };

  const spinner = syncing ? <Loader2 aria-hidden className="h-4 w-4 shrink-0 animate-spin text-blue-500 motion-reduce:animate-none" /> : undefined;

  return (
    <SettingsTabBody>
      <SettingsGroup label={settingsTexts.groups.cloud} footer={t("settings.storage.cloudInfoDescription")}>
        <CloudUsage usage={usage} lastSync={lastSync} />
        <SettingsRow icon={RefreshCw} tone="blue" title={syncing ? settingsTexts.syncing : settingsTexts.syncNow} trailing={spinner} chevron={false} onClick={runSync} />
      </SettingsGroup>
      <SettingsGroup label={settingsTexts.groups.data} footer={t("settings.storage.appDataItems")}>
        <SettingsRow icon={Download} tone="purple" title={settingsTexts.exportTitle} subtitle={settingsTexts.exportText} onClick={exportSettings} />
      </SettingsGroup>
    </SettingsTabBody>
  );
}
