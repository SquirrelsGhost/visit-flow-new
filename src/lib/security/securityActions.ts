import { getAccessToken } from "../auth/accessToken";
import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, messageOf } from "../battle/legacyRequest";
import { demoChange, demoWait } from "./securityDemoStore";
import { auditCsv } from "./securityLogic";
import type { AuditEntry, AuditFilter, BlockedIp, WhitelistEntry } from "./securityTypes";

/**
 * Schreiben über die v1-Endpunkte. Jede Funktion wirft bei Fehlern mit der Server-Meldung;
 * in der Demo merkt sich der Tab die Änderung (securityDemoStore).
 */
async function send(path: string, init: RequestInit): Promise<void> {
  const res = await legacyRequest(path, init);
  if (!res.success) throw new Error(messageOf(res) || "");
}

const enc = encodeURIComponent;
const demo = hasDemoSession;

/** Firewall-Sperre aufheben (DELETE /security/ddos/unblock/:ip). */
export async function unblockIp(ip: string): Promise<void> {
  if (demo()) return demoWait().then(() => demoChange((c) => ({ unblocked: [...c.unblocked, ip], blocked: c.blocked.filter((b) => b.ip !== ip) })));
  await send(`/security/ddos/unblock/${enc(ip)}`, json("DELETE"));
}

/** IP von Hand sperren (POST /security/ddos/block); ohne "dauerhaft" setzt der v1-Server die Standard-Sperrzeit. */
export async function blockIp(ip: string, reason: string, permanent: boolean): Promise<void> {
  if (demo()) {
    const now = Date.now();
    const entry: BlockedIp = { ip, reason, category: "manual", blockedAt: now, blockedUntil: permanent ? undefined : now + 60 * 60_000, isPermanent: permanent, isActive: true, requestCount: 0, violations: 0, wasAuthenticated: false };
    return demoWait().then(() => demoChange((c) => ({ blocked: [entry, ...c.blocked.filter((b) => b.ip !== ip)], unblocked: c.unblocked.filter((x) => x !== ip) })));
  }
  await send("/security/ddos/block", json("POST", { ip, reason, permanent }));
}

export async function addWhitelist(ip: string, comment: string): Promise<void> {
  if (demo()) {
    const entry: WhitelistEntry = { ip, comment, addedAt: Date.now(), addedBy: "admin@demo.local" };
    return demoWait().then(() => demoChange((c) => ({ whitelistAdded: [entry, ...c.whitelistAdded.filter((w) => w.ip !== ip)], whitelistRemoved: c.whitelistRemoved.filter((x) => x !== ip) })));
  }
  await send("/security/whitelist", json("POST", { ip, comment }));
}

export async function removeWhitelist(ip: string): Promise<void> {
  if (demo()) return demoWait().then(() => demoChange((c) => ({ whitelistRemoved: [...c.whitelistRemoved, ip], whitelistAdded: c.whitelistAdded.filter((w) => w.ip !== ip) })));
  await send(`/security/whitelist/${enc(ip)}`, json("DELETE"));
}

/** Login-Sperre nach Fehlversuchen aufheben (POST /security/unlock-ip/:ip). */
export async function unlockLogin(ip: string): Promise<void> {
  if (demo()) return demoWait().then(() => demoChange((c) => ({ unlocked: [...c.unlocked, ip] })));
  await send(`/security/unlock-ip/${enc(ip)}`, json("POST"));
}

export async function acknowledgeAlert(id: string): Promise<void> {
  if (demo()) return demoWait(250).then(() => demoChange((c) => ({ acknowledged: [...c.acknowledged, id] })));
  await send(`/security/alerts/${enc(id)}/acknowledge`, json("POST"));
}

/** Kopierschutz-Sperre lösen und Wert auf 0 setzen (POST /admin/unblock-ip/:ip, wie v1 "Entsperren"). */
export async function clearThreat(ip: string): Promise<void> {
  if (demo()) return demoWait().then(() => demoChange((c) => ({ threatsCleared: [...c.threatsCleared, ip] })));
  await send(`/admin/unblock-ip/${enc(ip)}`, json("POST"));
}

/** Eindringling als "an Behörden gemeldet" markieren (v1 schreibt das Datum als Notiz mit). */
export async function reportIntruder(id: string, note: string): Promise<void> {
  if (demo()) return demoWait().then(() => demoChange((c) => ({ reported: [...c.reported, id] })));
  await send(`/security/honeypot/intruders/${enc(id)}/report`, json("POST", { notes: note }));
}

/** Gesperrtes Konto wieder freigeben (PATCH /admin/users/:id { isBlocked: false } wie v1 UserManagementTab). */
export async function unblockAccount(id: string): Promise<void> {
  if (demo()) return demoWait().then(() => demoChange((c) => ({ accountsUnblocked: [...c.accountsUnblocked, id] })));
  await send(`/admin/users/${enc(id)}`, json("PATCH", { isBlocked: false }));
}

export async function deleteAuditEntry(id: string): Promise<void> {
  if (demo()) return demoWait(250).then(() => demoChange((c) => ({ deletedLogs: [...c.deletedLogs, id] })));
  await send(`/security/audit-log/${enc(id)}`, json("DELETE"));
}

/** Einträge älter als `days` Tage löschen (DELETE /security/audit-log/cleanup?daysOld=). */
export async function cleanupAudit(days: number): Promise<void> {
  if (demo()) return demoWait().then(() => demoChange(() => ({ cleanupBefore: Date.now() - days * 86_400_000 })));
  await send(`/security/audit-log/cleanup?daysOld=${days}`, json("DELETE"));
}

function download(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([`﻿${text}`], { type: "text/csv;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** CSV vom Server (v1 /security/audit-log/export, alle Einträge); geht das nicht, die geladenen Einträge. */
export async function exportAudit(filter: AuditFilter, shown: readonly AuditEntry[]): Promise<void> {
  const name = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  if (!demo()) {
    const query = filter.category === "all" ? "" : `?category=${filter.category}`;
    const token = getAccessToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/security/audit-log/export${query}`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} }).catch(() => null);
    if (res?.ok) return download(name, await res.text());
  }
  download(name, auditCsv(shown));
}
