import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useTranslation } from "../../hooks/useTranslation";
import { cn } from "../../lib/cn";

/** Kleiner Status-Punkt (v1: OfflineIndicator ohne Text): grün online, gelb pulsierend offline. */
export default function OnlineDot() {
  const online = useOnlineStatus();
  const { t } = useTranslation();
  return (
    <span className="relative flex h-2.5 w-2.5" title={online ? undefined : t("nav.offline")} aria-hidden={online}>
      {!online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", online ? "bg-emerald-500" : "bg-yellow-500")} />
    </span>
  );
}
