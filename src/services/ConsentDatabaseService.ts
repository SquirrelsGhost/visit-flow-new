import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { kuerzeIp, uaFingerprint } from "./sicherheit/Sitzungswachdienst";
import type { StoredRecord } from "./store/RecordStore";
import { createStore } from "./store/storeFactory";

export interface DsgvoConsentRecord extends StoredRecord {
  id: string;
  userId?: string;
  analytics: boolean;
  externalMedia: boolean;
  version: number;
  ipKuerzel: string;
  userAgentHash: string;
  receivedAt: string;
}

const consentStore = () => createStore<DsgvoConsentRecord>("consents");

/**
 * DSGVO Art. 7 Nachweis-Protokoll für Cookie- & Datenschutzeinwilligungen.
 * Speichert ausschließlich anonymisierte IP-Kürzel (`kuerzeIp`) und gehashte User-Agents.
 */
export class ConsentDatabaseService {
  static async recordConsent(
    req: Request,
    input: {
      id?: unknown;
      analytics?: unknown;
      externalMedia?: unknown;
      version?: unknown;
      v?: unknown;
      choice?: Record<string, unknown>;
    },
    userId?: string,
  ): Promise<DsgvoConsentRecord> {
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "lokal";
    const ua = req.headers.get("user-agent") ?? "";
    const now = new Date();
    const cutoffMs = now.getTime() - env.consentRetentionDays * 24 * 60 * 60 * 1000;
    const cutoffIso = new Date(cutoffMs).toISOString();

    await consentStore()
      .removeWhere((c) => c.receivedAt < cutoffIso)
      .catch(() => undefined);

    const choice = input.choice && typeof input.choice === "object" ? input.choice : undefined;
    const analytics = choice ? Boolean(choice.analytics) : Boolean(input.analytics);
    const externalMedia = choice
      ? Boolean(choice.externalMedia ?? choice.marketing)
      : Boolean(input.externalMedia);
    const version =
      typeof input.version === "number"
        ? input.version
        : typeof input.v === "number"
          ? input.v
          : 1;
    const customId =
      typeof input.id === "string" && /^[\w-]{8,64}$/.test(input.id) ? input.id : randomUUID();

    const record: DsgvoConsentRecord = {
      id: customId,
      userId,
      analytics,
      externalMedia,
      version,
      ipKuerzel: kuerzeIp(rawIp),
      userAgentHash: uaFingerprint(ua),
      receivedAt: now.toISOString(),
    };

    return consentStore().upsert(record);
  }

  static async listConsents(limit = 100): Promise<DsgvoConsentRecord[]> {
    const all = await consentStore().list();
    return all.slice(0, limit);
  }
}
