import { hasDemoSession } from "../auth/demoSession";
import { demoMeMetrics } from "./meDemoData";
import type { MeMetrics } from "./meTypes";

/**
 * Zahlen für den Reiter "Ich". Im Demo-Modus kommen sie aus dem Beispielpaket. Ohne Demo gibt es sie erst,
 * wenn Besuche, Türen und Produkte (v1 DataContext + MetricsService) in v2 angebunden sind; bis dahin null.
 */
export async function loadMeMetrics(): Promise<MeMetrics | null> {
  if (!hasDemoSession()) return null;
  await new Promise((resolve) => setTimeout(resolve, 300));
  return demoMeMetrics();
}
