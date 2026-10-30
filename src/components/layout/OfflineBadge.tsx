import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useTranslation } from "../../hooks/useTranslation";

/** Gelbes Offline-Zeichen links in der unteren Navigation (v1). Ausstehende Änderungen kommen mit dem Offline-Speicher. */
export interface OfflineBadgeProps { readonly _?: never; }

export default function OfflineBadge() {
  const online = useOnlineStatus();
  const { t } = useTranslation();
  return (
    <AnimatePresence initial={false}>
      {!online && (
        <motion.li
          key="offline"
          initial={{ opacity: 0, width: 0, scale: 0.6 }}
          animate={{ opacity: 1, width: "auto", scale: 1 }}
          exit={{ opacity: 0, width: 0, scale: 0.6 }}
          className="flex flex-shrink-0 items-center justify-center self-center"
          title={t("nav.offline")}
        >
          <span className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
            <WifiOff className="h-3.5 w-3.5 animate-pulse" />
          </span>
        </motion.li>
      )}
    </AnimatePresence>
  );
}
