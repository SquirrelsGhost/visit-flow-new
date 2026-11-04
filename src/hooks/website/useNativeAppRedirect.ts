import { Capacitor } from "@capacitor/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WEBSITE_LINKS } from "../../lib/website/websiteLinks";

/**
 * Die native App und die installierte Web-App starten auf "/": dort gehört die App hin, nicht die Website.
 * Gibt true zurück, solange weitergeleitet wird, damit die Website nicht kurz aufblitzt.
 */
export function useNativeAppRedirect(): boolean {
  const router = useRouter();
  const [redirecting] = useState(
    () =>
      typeof window !== "undefined" &&
      (Capacitor.isNativePlatform() || window.matchMedia("(display-mode: standalone)").matches),
  );

  useEffect(() => {
    if (redirecting) router.replace(WEBSITE_LINKS.app);
  }, [redirecting, router]);

  return redirecting;
}
