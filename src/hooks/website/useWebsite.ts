import { useContext } from "react";
import { WebsiteContext } from "../../lib/website/websiteContext";

/** Zugriff auf Scroll-Container und Farbstimmung der Website. */
export function useWebsite() {
  const context = useContext(WebsiteContext);
  if (!context) throw new Error("useWebsite muss innerhalb von WebsiteRoot verwendet werden");
  return context;
}
