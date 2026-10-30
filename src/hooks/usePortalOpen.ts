import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Portal } from "../lib/assistant/portals";
import { hapticFeedback } from "../lib/device/haptics";
import { assistantTexts as t } from "../texts/assistantTexts";

/** Öffnet ein Portal: fremde Seiten im neuen Tab, App-Seiten per Router, noch nicht übernommene Dialoge mit Hinweis. */
export function usePortalOpen() {
  const router = useRouter();
  return (portal: Portal) => {
    if (portal.maintenance) return;
    hapticFeedback("light");
    const { action } = portal;
    if (action.kind === "external") {
      const tab = window.open(action.url, "_blank", "noopener,noreferrer");
      if (!tab) toast.error(t.popupBlocked);
    } else if (action.kind === "internal") {
      router.push(action.href);
    } else {
      toast.info(portal.pendingNote ?? t.portalPending(portal.title));
    }
  };
}
