import { createHash } from "node:crypto";
import { kanonischeEmail } from "@/lib/sicherheit/emailSchutz";
import { clearMemoryStores } from "@/services/store/MemoryRecordStore";
import type { StoredRecord } from "@/services/store/RecordStore";
import { createStore } from "@/services/store/storeFactory";

interface BackoffEintrag {
  fehlversuche: number;
  zuletztAm: number;
  gesperrtBis: number;
}

export interface PersistentRateLimitRecord extends StoredRecord, BackoffEintrag {}

const FENSTER_MS = 15 * 60 * 1000; // 15 Minuten Beobachtungsfenster
const BASIS_SPERRE_MS = 5 * 1000; // 5s -> 10s -> 20s -> 40s ... bis 15 Min.
const MAX_SPERRE_MS = 15 * 60 * 1000;
const FREI_VERSUCHE_IP = 4;
const FREI_VERSUCHE_EMAIL = 4;
const FREI_VERSUCHE_GERAET = 5;

const speicher = new Map<string, BackoffEintrag>();
const rateLimitStore = () => createStore<PersistentRateLimitRecord>("rate-limits");

function hashKey(prefix: "ip" | "email" | "hw", raw: string): string {
  const norm = prefix === "email" ? kanonischeEmail(raw) : raw.trim().toLowerCase();
  return `${prefix}:${createHash("sha256").update(norm, "utf8").digest("hex").slice(0, 32)}`;
}

function berechneSperreMs(fehlversuche: number, freiVersuche: number): number {
  const ueberschuss = fehlversuche - freiVersuche;
  if (ueberschuss <= 0) return 0;
  return Math.min(MAX_SPERRE_MS, BASIS_SPERRE_MS * Math.pow(2, ueberschuss - 1));
}

/**
 * Persistentes Exponential Backoff pro IP, kanonischer E-Mail-Adresse und Hardware-Fingerprint (`HW-...`).
 * Alle Schlüssel sind DSGVO-konform gehasht (SHA-256) und werden im L1-Cache + Datenbank-Store gespeichert.
 */
export class LoginBackoffService {
  static pruefeSperre(
    ip: string,
    email: string,
    geraet?: string,
    nowMs = Date.now(),
  ): { gesperrt: boolean; gesperrtBis?: number; restSekunden?: number } {
    const keys = [hashKey("ip", ip), hashKey("email", email)];
    if (geraet && geraet.startsWith("HW-")) {
      keys.push(hashKey("hw", geraet));
    }

    let maxGesperrtBis = 0;
    for (const k of keys) {
      const eintrag = speicher.get(k);
      if (!eintrag) continue;
      if (nowMs - eintrag.zuletztAm > FENSTER_MS) {
        speicher.delete(k);
        continue;
      }
      if (eintrag.gesperrtBis > nowMs && eintrag.gesperrtBis > maxGesperrtBis) {
        maxGesperrtBis = eintrag.gesperrtBis;
      }
    }

    if (maxGesperrtBis > nowMs) {
      return {
        gesperrt: true,
        gesperrtBis: maxGesperrtBis,
        restSekunden: Math.ceil((maxGesperrtBis - nowMs) / 1000),
      };
    }
    return { gesperrt: false };
  }

  static async pruefeSperreAsync(
    ip: string,
    email: string,
    geraet?: string,
    nowMs = Date.now(),
  ): Promise<{ gesperrt: boolean; gesperrtBis?: number; restSekunden?: number }> {
    const keys = [hashKey("ip", ip), hashKey("email", email)];
    if (geraet && geraet.startsWith("HW-")) {
      keys.push(hashKey("hw", geraet));
    }
    for (const k of keys) {
      if (!speicher.has(k)) {
        const persisted = await rateLimitStore().get(k);
        if (persisted) {
          speicher.set(k, {
            fehlversuche: persisted.fehlversuche,
            zuletztAm: persisted.zuletztAm,
            gesperrtBis: persisted.gesperrtBis,
          });
        }
      }
    }
    return LoginBackoffService.pruefeSperre(ip, email, geraet, nowMs);
  }

  static registriereFehlversuch(ip: string, email: string, geraet?: string, nowMs = Date.now()): void {
    const ziele: { key: string; frei: number }[] = [
      { key: hashKey("ip", ip), frei: FREI_VERSUCHE_IP },
      { key: hashKey("email", email), frei: FREI_VERSUCHE_EMAIL },
    ];
    if (geraet && geraet.startsWith("HW-")) {
      ziele.push({ key: hashKey("hw", geraet), frei: FREI_VERSUCHE_GERAET });
    }

    const nowIso = new Date(nowMs).toISOString();
    for (const { key, frei } of ziele) {
      const alt = speicher.get(key);
      const imFenster = alt && nowMs - alt.zuletztAm <= FENSTER_MS;
      const fehlversuche = (imFenster ? alt.fehlversuche : 0) + 1;
      const sperreMs = berechneSperreMs(fehlversuche, frei);
      const eintrag: BackoffEintrag = {
        fehlversuche,
        zuletztAm: nowMs,
        gesperrtBis: sperreMs > 0 ? nowMs + sperreMs : 0,
      };
      speicher.set(key, eintrag);
      void rateLimitStore()
        .upsert({ id: key, receivedAt: nowIso, ...eintrag })
        .catch(() => undefined);
    }
  }

  static setzeZurueck(ip: string, email: string, geraet?: string): void {
    const keys = [hashKey("ip", ip), hashKey("email", email)];
    if (geraet && geraet.startsWith("HW-")) {
      keys.push(hashKey("hw", geraet));
    }
    for (const k of keys) {
      speicher.delete(k);
    }
    const keySet = new Set(keys);
    void rateLimitStore()
      .removeWhere((r) => keySet.has(r.id))
      .catch(() => undefined);
  }

  static resetFuerTests(): void {
    speicher.clear();
    clearMemoryStores();
  }
}
