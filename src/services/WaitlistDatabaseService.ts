import { createHash, randomUUID } from "node:crypto";
import { kanonischeEmail } from "@/lib/sicherheit/emailSchutz";
import { WAITLIST_CONSENT_VERSION, type WaitlistInput, type WaitlistRole } from "@/lib/waitlist/waitlistRules";
import { kuerzeIp } from "./sicherheit/Sitzungswachdienst";
import type { StoredRecord } from "./store/RecordStore";
import { createStore } from "./store/storeFactory";

export interface WaitlistRecord extends StoredRecord {
  id: string;
  /** Klartext-Adresse für die Startnachricht; im Store AES-256-GCM-verschlüsselt, sobald VF_DATA_KEY gesetzt ist. */
  email: string;
  /** SHA-256 der kanonischen Adresse, um doppelte Einträge zu erkennen. */
  emailHash: string;
  role: WaitlistRole;
  teamSize?: number;
  position: number;
  consentVersion: number;
  ipKuerzel: string;
  receivedAt: string;
}

export interface WaitlistJoinResult {
  position: number;
  /** true, wenn die Adresse schon eingetragen war (dann bleibt der alte Platz). */
  already: boolean;
}

const waitlistStore = () => createStore<WaitlistRecord>("waitlist");

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

function hashEmail(email: string): string {
  return createHash("sha256").update(kanonischeEmail(email), "utf8").digest("hex");
}

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "lokal";
}

/**
 * Warteliste der Website: Eintragen mit fortlaufendem Platz, doppelte Adressen behalten ihren Platz.
 * Schutz: Honigtopf-Feld und höchstens 5 Eintragungen pro IP in 10 Minuten.
 */
export class WaitlistDatabaseService {
  /** Prüft das Limit pro IP. Gibt false zurück, wenn zu viele Versuche kamen. */
  static allow(req: Request, nowMs = Date.now()): boolean {
    const key = kuerzeIp(clientIp(req));
    const recent = (attempts.get(key) ?? []).filter((at) => nowMs - at < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
      attempts.set(key, recent);
      return false;
    }
    recent.push(nowMs);
    attempts.set(key, recent);
    return true;
  }

  static async join(req: Request, input: WaitlistInput): Promise<WaitlistJoinResult> {
    const store = waitlistStore();
    const emailHash = hashEmail(input.email);
    const existing = (await store.list()).find((r) => r.emailHash === emailHash);
    if (existing) return { position: existing.position, already: true };

    const saved = await store.insert((existingIds) => ({
      id: randomUUID(),
      email: input.email,
      emailHash,
      role: input.role,
      teamSize: input.teamSize,
      position: existingIds.length + 1,
      consentVersion: WAITLIST_CONSENT_VERSION,
      ipKuerzel: kuerzeIp(clientIp(req)),
      receivedAt: new Date().toISOString(),
    }));
    return { position: saved.position, already: false };
  }

  static async count(): Promise<number> {
    return (await waitlistStore().list()).length;
  }

  /** Nur für Tests: Limit-Speicher leeren. */
  static resetLimits(): void {
    attempts.clear();
  }
}
