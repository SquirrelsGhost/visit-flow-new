/**
 * "Karte reparieren" aus v1: gespeicherten Mapbox-Schlüssel vergessen, Service-Worker aktualisieren,
 * Caches leeren und neu laden. Hilft bei kaputtem Token oder veraltetem Karten-Chunk.
 */
export async function repairMap(): Promise<void> {
  try {
    window.localStorage.removeItem("mapbox-token");
  } catch {
    // ohne localStorage gibt es auch keinen alten Schlüssel
  }
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.update().catch(() => undefined)));
    }
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // Neuladen hilft trotzdem
  }
  window.location.reload();
}
