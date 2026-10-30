import { Cloud } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { formatBytes, usagePercent, type StorageUsage } from "../../lib/settings/storageUsage";
import { settingsTexts } from "../../texts/settingsTexts";
import GlassNumber from "../glass/GlassNumber";
import GlassProgress from "../glass/GlassProgress";
import SettingsRowText from "./SettingsRowText";
import SettingsRowTile from "./SettingsRowTile";

interface CloudUsageProps {
  usage: StorageUsage | null;
  lastSync: Date | null;
}

/** Belegung der User-Cloud (v1 StorageSettings): große Prozentzahl, die hochzählt, und ein leuchtender Balken. */
export default function CloudUsage({ usage, lastSync }: CloudUsageProps) {
  const { t } = useTranslation();
  const percent = usage ? usagePercent(usage) : 0;
  const amount = settingsTexts.usageOf.replace("{used}", formatBytes(usage?.used ?? 0)).replace("{total}", formatBytes(usage?.total ?? 0));
  const synced = lastSync ? ` · ${t("settings.storage.lastSync").replace("{time}", lastSync.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }))}` : "";

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3.5">
        <SettingsRowTile icon={Cloud} tone="blue" />
        <SettingsRowText title={t("settings.storage.cloudTitle")} subtitle={amount + synced} />
        <GlassNumber value={Math.round(percent)} kind="percent" className="shrink-0 text-[26px] font-semibold tracking-[-0.03em] text-foreground" />
      </div>
      <GlassProgress
        share={Math.max(percent, usage ? 1.5 : 0) / 100}
        tone="blue"
        label={t("settings.storage.cloudTitle")}
        now={Math.round(percent)}
        max={100}
        className="ml-[3.125rem] mt-3.5 h-2"
      />
    </div>
  );
}
