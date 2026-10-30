/**
 * Geräte-Fingerprint und steganografisches Zero-Width-Wasserzeichen (VF-Shield aus v1).
 * Funktioniert im Browser und liefert unter SSR/Tests einen stabilen Fallback.
 */

function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) + hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCanvasHash(): number {
  if (typeof document === "undefined") return 0;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 48;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = "#0f172a";
    ctx.fillText("Visit Flow © 2026 PYCIE", 2, 14);
    return djb2Hash(canvas.toDataURL());
  } catch {
    return 0;
  }
}

function getScreenProfile(): string {
  if (typeof window === "undefined" || typeof screen === "undefined") return "ssr";
  return [
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio || 1,
    navigator.maxTouchPoints || 0,
    navigator.hardwareConcurrency || 0,
    navigator.language || "de",
    new Date().getTimezoneOffset(),
  ].join("|");
}

let cachedFingerprint: string | null = null;

/** Eindeutiger Geräte-Fingerprint für Wasserzeichen, Audit-Log und Sicherheitsvertrag. */
export function getFingerprint(): string {
  if (cachedFingerprint) return cachedFingerprint;
  if (typeof window === "undefined") return "VF-SERVER";
  try {
    const canvasH = getCanvasHash();
    const screenH = djb2Hash(getScreenProfile());
    const uaH = djb2Hash(navigator.userAgent || "vf");
    const combined = (canvasH ^ screenH ^ uaH) >>> 0;
    const p1 = combined.toString(36).toUpperCase();
    const p2 = screenH.toString(36).toUpperCase();
    const p3 = uaH.toString(36).toUpperCase();
    cachedFingerprint = `VF-${p1}-${p2}-${p3}`.substring(0, 22);
    return cachedFingerprint;
  } catch {
    return "VF-FALLBACK";
  }
}

const HW_STORAGE_KEY = "vf_hw_id";

function fnv1aHardwareHash(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c;
    h2 = Math.imul(h2, 0x811c9dc5);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(4, "0").slice(0, 4);
  return `HW-${(hex1 + hex2).toUpperCase()}`;
}

function holeGpuInfo(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "no-webgl";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return String(gl.getParameter(gl.VERSION) ?? "webgl");
    const vendor = String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ?? "");
    const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? "");
    return `${vendor}|${renderer}`;
  } catch {
    return "err-webgl";
  }
}

/**
 * Pycie Standard Hardware-Fingerprint (`HW-...`):
 * WebGL-GPU + Screen + CPU + DeviceMemory + Timezone Hash zur Erkennung gesperrter Geräte trotz VPN-Wechsel.
 */
export function holeGeraetFingerprint(): string {
  if (typeof window === "undefined") return "HW-SERVER000000";
  try {
    const teile = [
      holeGpuInfo(),
      `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
      String(window.devicePixelRatio || 1),
      String(navigator.hardwareConcurrency || 0),
      String((navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0),
      navigator.platform || "",
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    ];
    const berechnet = fnv1aHardwareHash(teile.join("||"));
    try {
      if (!window.localStorage.getItem(HW_STORAGE_KEY)) {
        window.localStorage.setItem(HW_STORAGE_KEY, berechnet);
      }
    } catch {
      // localStorage im Privatmodus ggf. blockiert
    }
    return berechnet;
  } catch {
    return "HW-FALLBACK0000";
  }
}

/**
 * Codiert einen String als unsichtbare Zero-Width-Unicode-Zeichen (Steganografie).
 * Beim Kopieren von Text aus der App wird der Fingerprint unsichtbar eingebettet.
 */
export function encodeZeroWidth(input: string): string {
  const zw = ["\u200B", "\u200C", "\u200D", "\uFEFF"] as const;
  let result = "";
  for (let i = 0; i < Math.min(input.length, 20); i++) {
    const code = input.charCodeAt(i);
    result += zw[(code >> 6) & 3];
    result += zw[(code >> 4) & 3];
    result += zw[(code >> 2) & 3];
    result += zw[code & 3];
  }
  return result;
}
