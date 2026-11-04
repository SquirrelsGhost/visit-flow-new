import { useCallback, useSyncExternalStore } from "react";
import { isWebsiteSoundOn, setWebsiteSound, siteFeedback, WEBSITE_SOUND_EVENT } from "../../lib/website/websiteFeedback";

function subscribe(onChange: () => void) {
  window.addEventListener(WEBSITE_SOUND_EVENT, onChange);
  return () => window.removeEventListener(WEBSITE_SOUND_EVENT, onChange);
}

/** Schalter für die Klänge der Website (gespeichert je Gerät). */
export function useWebsiteSound() {
  const on = useSyncExternalStore(subscribe, isWebsiteSoundOn, () => false);

  const toggle = useCallback(() => {
    const next = !isWebsiteSoundOn();
    setWebsiteSound(next);
    if (next) siteFeedback("success");
  }, []);

  return { on, toggle };
}
