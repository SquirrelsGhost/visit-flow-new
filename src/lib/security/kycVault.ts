import { downloadPdf } from "@/lib/forms/formPdf";

export interface KycChallenge {
  spokenPin: string;
  movements: readonly [string, string, string];
}

export interface KycVaultEntry {
  userId: string;
  spokenPin: string;
  videoSha256: string;
  videoMimeType: string;
  videoDataUrl: string;
  frontIdDataUrl: string;
  backIdDataUrl: string;
  recordedAt: string;
}

const DB_NAME = "vf_kyc_vault_db";
const STORE_NAME = "kyc_records";

export function createKycChallenge(): KycChallenge {
  const pin = String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0]! % 9000));
  return {
    spokenPin: pin,
    movements: [
      "1. Kopf langsam nach LINKS drehen",
      "2. Kopf langsam nach RECHTS drehen",
      "3. Kopf leicht nach OBEN neigen & Ausweis neben das Gesicht halten",
    ],
  };
}

export async function sha256Hex(input: ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : input instanceof Uint8Array
        ? input
        : new Uint8Array(input);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buf).set(bytes);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h).toString(16).toUpperCase().padStart(16, "0");
}

/** Brennt ein § 20 PAuswG-konformes Kopie-Wasserzeichen quer über das Ausweisbild. */
export async function watermarkIdImage(file: File): Promise<string> {
  const rawUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden"));
    reader.readAsDataURL(file);
  });

  if (typeof document === "undefined" || typeof Image === "undefined") return rawUrl;

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxW = 900;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.max(320, Math.round(img.width * scale));
        canvas.height = Math.max(200, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-0.32);
        ctx.fillStyle = "rgba(220, 38, 38, 0.28)";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        const stamp = `KOPIE - NUR ZUR IDENT-PRÜFUNG VISIT FLOW (${new Date().toLocaleDateString("de-DE")})`;
        ctx.fillText(stamp, 0, -14);
        ctx.fillText("§ 20 Abs. 2 PAuswG • PYCIE STUDIO", 0, 16);
        ctx.restore();
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        resolve(rawUrl);
      }
    };
    img.onerror = () => resolve(rawUrl);
    img.src = rawUrl;
  });
}

function openVaultDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "userId" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveKycVaultEntry(entry: KycVaultEntry): Promise<void> {
  const db = await openVaultDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export function downloadDataUrlFile(dataUrl: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export { downloadPdf };
