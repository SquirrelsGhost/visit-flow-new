import { createHash, randomBytes, randomUUID } from "node:crypto";
import { clearMemoryStores } from "@/services/store/MemoryRecordStore";
import { SqlSessionsRepo } from "@/services/store/sqlSessionsRepo";

export const ROTATION_INTERVALL_MS = 15 * 60 * 1000; // Token-ID (jti) alle 15 Min. rotieren
export const PARALLEL_TOLERANZ_MS = 60 * 1000; // 60 Sek. Toleranz für parallele Browser-Requests

export interface ServerSitzungRecord {
  id: string;
  inhaberId: string;
  inhaberName: string;
  aktivesTokenId: string;
  vorherigesTokenId?: string;
  rotiertAm: string;
  erstelltAm: string;
  zuletztAktivAm: string;
  laeuftAbAm: string;
  userAgentHash: string;
  geraetFingerprint?: string;
  ipKuerzel: string;
  browser: string;
  widerrufenAm?: string;
  widerrufGrund?: string;
}

export interface SitzungPruefErgebnis {
  gueltig: boolean;
  sitzung?: ServerSitzungRecord;
  neuesTokenId?: string;
  diebstahlErkannt?: boolean;
}

const sitzungenMap = new Map<string, ServerSitzungRecord>();

export function erkenneBrowserFamilie(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome/") || ua.includes("crios/")) return "Chrome";
  if (ua.includes("firefox/") || ua.includes("fxios/")) return "Firefox";
  if (ua.includes("safari/")) return "Safari";
  return "Browser";
}

export function uaFingerprint(userAgent: string): string {
  const familie = erkenneBrowserFamilie(userAgent);
  return createHash("sha256").update(`vf-ua:${familie}:${userAgent.slice(0, 64)}`, "utf8").digest("base64url").slice(0, 16);
}

export function kuerzeIp(ip: string): string {
  const trimmed = ip.trim();
  if (!trimmed) return "lokal";
  const parts = trimmed.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return trimmed.slice(0, 18);
}

async function ladeSitzung(sitzungId: string): Promise<ServerSitzungRecord | undefined> {
  const cached = sitzungenMap.get(sitzungId);
  if (cached) return cached;
  const persisted = await SqlSessionsRepo.getById(sitzungId);
  if (persisted) {
    sitzungenMap.set(persisted.id, persisted);
    return persisted;
  }
  return undefined;
}

/**
 * Stateful Server-Session & Anti-Theft Watchdog (`Sitzungswachdienst`):
 * - Persistiert jede Sitzung in PostgreSQL (`vf_sessions`) bzw. im verschlüsselten File-Store
 * - Jede Sitzung ist an `userAgentHash` gebunden
 * - Rotiert `tokenId` (`jti`) alle 15 Minuten (mit 60s Parallel-Toleranz)
 * - Widerruft bei Token-Reuse (Cookie-Diebstahl) sofort alle Sitzungen des Nutzers
 */
export class Sitzungswachdienst {
  static async erstelleSitzung(
    inhaberId: string,
    inhaberName: string,
    lebensdauerSekunden: number,
    req?: Request,
    nowMs = Date.now(),
  ): Promise<ServerSitzungRecord> {
    const now = new Date(nowMs);
    const ua = req?.headers.get("user-agent") ?? "";
    const rawIp = req?.headers.get("x-forwarded-for")?.split(",")[0] ?? req?.headers.get("x-real-ip") ?? "lokal";
    const geraet = req?.headers.get("x-device-fingerprint") ?? undefined;
    const datensatz: ServerSitzungRecord = {
      id: randomUUID(),
      inhaberId: inhaberId.toLowerCase(),
      inhaberName,
      aktivesTokenId: randomBytes(16).toString("base64url"),
      rotiertAm: now.toISOString(),
      erstelltAm: now.toISOString(),
      zuletztAktivAm: now.toISOString(),
      laeuftAbAm: new Date(nowMs + lebensdauerSekunden * 1000).toISOString(),
      userAgentHash: uaFingerprint(ua),
      geraetFingerprint: geraet?.startsWith("HW-") ? geraet : undefined,
      ipKuerzel: kuerzeIp(rawIp),
      browser: erkenneBrowserFamilie(ua),
    };
    await Sitzungswachdienst.bereinigeAbgelaufene(nowMs);
    sitzungenMap.set(datensatz.id, datensatz);
    await SqlSessionsRepo.upsert(datensatz);
    return datensatz;
  }

  static async pruefeUndAktualisiere(
    sitzungId: string,
    tokenId: string,
    userAgent?: string,
    erlaubeRotation = false,
    nowMs = Date.now(),
  ): Promise<SitzungPruefErgebnis> {
    const sitzung = await ladeSitzung(sitzungId);
    if (!sitzung || sitzung.widerrufenAm) return { gueltig: false };
    if (new Date(sitzung.laeuftAbAm).getTime() <= nowMs) return { gueltig: false };

    if (userAgent !== undefined && sitzung.userAgentHash !== uaFingerprint(userAgent)) {
      await Sitzungswachdienst.widerrufe(sitzung.id, "Geräte-Signatur abweichend", nowMs);
      return { gueltig: false };
    }

    const istAktuell = tokenId === sitzung.aktivesTokenId;
    const istVorherigesInToleranz =
      Boolean(sitzung.vorherigesTokenId) &&
      tokenId === sitzung.vorherigesTokenId &&
      nowMs - new Date(sitzung.rotiertAm).getTime() <= PARALLEL_TOLERANZ_MS;

    if (!istAktuell && !istVorherigesInToleranz) {
      await Sitzungswachdienst.widerrufeAlleFuerInhaber(
        sitzung.inhaberId,
        "Token-Wiederverwendung erkannt (Cookie-Diebstahl-Verdacht)",
        undefined,
        nowMs,
      );
      return { gueltig: false, diebstahlErkannt: true };
    }

    const brauchtRotation =
      erlaubeRotation && istAktuell && nowMs - new Date(sitzung.rotiertAm).getTime() >= ROTATION_INTERVALL_MS;
    const neuesTokenId = brauchtRotation ? randomBytes(16).toString("base64url") : undefined;
    const nowIso = new Date(nowMs).toISOString();

    const aktualisiert: ServerSitzungRecord = {
      ...sitzung,
      zuletztAktivAm: nowIso,
      aktivesTokenId: neuesTokenId ?? sitzung.aktivesTokenId,
      vorherigesTokenId: neuesTokenId ? sitzung.aktivesTokenId : sitzung.vorherigesTokenId,
      rotiertAm: neuesTokenId ? nowIso : sitzung.rotiertAm,
    };
    sitzungenMap.set(sitzung.id, aktualisiert);

    // Nur bei Token-Rotation oder maximal alle 60 Sekunden in den persistenten Store schreiben,
    // um unnötige I/O-Operationen bei jedem einzelnen API-Request zu vermeiden.
    const seitLetztemPersistMs = nowMs - new Date(sitzung.zuletztAktivAm).getTime();
    if (neuesTokenId || seitLetztemPersistMs >= 60_000) {
      await SqlSessionsRepo.upsert(aktualisiert);
    }

    return { gueltig: true, sitzung: aktualisiert, neuesTokenId };
  }

  static async holeSitzung(sitzungId: string): Promise<ServerSitzungRecord | undefined> {
    return ladeSitzung(sitzungId);
  }

  static async widerrufe(sitzungId: string, grund = "Manuell abgemeldet", nowMs = Date.now()): Promise<boolean> {
    const curr = await ladeSitzung(sitzungId);
    if (!curr) return false;
    const widerrufen: ServerSitzungRecord = {
      ...curr,
      widerrufenAm: new Date(nowMs).toISOString(),
      widerrufGrund: grund,
    };
    sitzungenMap.set(sitzungId, widerrufen);
    await SqlSessionsRepo.upsert(widerrufen);
    return true;
  }

  static async widerrufeAlleFuerInhaber(
    inhaberId: string,
    grund: string,
    ausnahmeSitzungId?: string,
    nowMs = Date.now(),
  ): Promise<number> {
    const ziel = inhaberId.toLowerCase();
    const dbListe = await SqlSessionsRepo.listAll();
    for (const s of dbListe) {
      if (!sitzungenMap.has(s.id)) sitzungenMap.set(s.id, s);
    }
    let anzahl = 0;
    for (const s of sitzungenMap.values()) {
      if (s.inhaberId === ziel && !s.widerrufenAm && s.id !== ausnahmeSitzungId) {
        await Sitzungswachdienst.widerrufe(s.id, grund, nowMs);
        anzahl++;
      }
    }
    return anzahl;
  }

  static async reaktiviereFuerInhaber(inhaberId: string): Promise<number> {
    const ziel = inhaberId.toLowerCase();
    const dbListe = await SqlSessionsRepo.listAll();
    for (const s of dbListe) {
      if (!sitzungenMap.has(s.id)) sitzungenMap.set(s.id, s);
    }
    let anzahl = 0;
    for (const s of sitzungenMap.values()) {
      if (s.inhaberId === ziel && s.widerrufenAm && s.widerrufGrund?.startsWith("Konto gesperrt:")) {
        const reaktiviert: ServerSitzungRecord = {
          ...s,
          widerrufenAm: undefined,
          widerrufGrund: undefined,
        };
        sitzungenMap.set(s.id, reaktiviert);
        await SqlSessionsRepo.upsert(reaktiviert);
        anzahl++;
      }
    }
    return anzahl;
  }

  static async aktiveSitzungen(inhaberId?: string, nowMs = Date.now()): Promise<ServerSitzungRecord[]> {
    const ziel = inhaberId?.toLowerCase();
    const dbListe = await SqlSessionsRepo.listAll();
    for (const s of dbListe) {
      if (!sitzungenMap.has(s.id)) sitzungenMap.set(s.id, s);
    }
    const liste: ServerSitzungRecord[] = [];
    for (const s of sitzungenMap.values()) {
      if (!s.widerrufenAm && new Date(s.laeuftAbAm).getTime() > nowMs) {
        if (!ziel || s.inhaberId === ziel) liste.push(s);
      }
    }
    return liste;
  }

  static async bereinigeAbgelaufene(nowMs = Date.now()): Promise<void> {
    const grenzeMs = nowMs - 7 * 24 * 60 * 60 * 1000;
    const isoCutoff = new Date(grenzeMs).toISOString();
    for (const [id, s] of sitzungenMap.entries()) {
      if (new Date(s.laeuftAbAm).getTime() < grenzeMs) {
        sitzungenMap.delete(id);
      }
    }
    await SqlSessionsRepo.removeExpiredBefore(isoCutoff);
  }

  static resetFuerTests(): void {
    sitzungenMap.clear();
    clearMemoryStores();
  }
}
