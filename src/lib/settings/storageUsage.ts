/** v1: jeder Benutzer hat 100 MB persönliche User-Cloud. */
export const CLOUD_QUOTA_BYTES = 100 * 1024 * 1024;

export interface StorageUsage {
  used: number;
  total: number;
}

const UNITS = ["Bytes", "KB", "MB", "GB"] as const;

/** Wie v1 formatBytes: auf zwei Nachkommastellen, deutsches Komma. */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 Bytes";
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = Math.round((bytes / 1024 ** exponent) * 100) / 100;
  return `${value.toLocaleString("de-DE")} ${UNITS[exponent]}`;
}

/** Belegung durch die App auf diesem Gerät (v1-Rückfall, wenn die Cloud keine Zahlen liefert). */
export function localStorageBytes(): number {
  let size = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) ?? "";
      size += key.length + (window.localStorage.getItem(key)?.length ?? 0);
    }
  } catch {
    return 0;
  }
  return size;
}

export function usagePercent({ used, total }: StorageUsage): number {
  return total > 0 ? Math.min((used / total) * 100, 100) : 0;
}
