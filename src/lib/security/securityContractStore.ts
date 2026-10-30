import { SECURITY_TERMS_VERSION } from "@/texts/securityPolicyTexts";
import { getFingerprint } from "./fingerprint";

export const SECURITY_GATE_OPEN_EVENT = "vf:security-gate-open";
export const LEADER_IDENT_OPEN_EVENT = "vf:leader-ident-open";
export const SECURITY_CONTRACT_UPDATED_EVENT = "vf:security-contract-updated";

const TERMS_KEY_PREFIX = `vf_security_accepted_${SECURITY_TERMS_VERSION}_`;
const IDENT_KEY_PREFIX = "vf_leader_ident_v1_";
const GATE_DRAFT_PREFIX = `vf_gate_draft_${SECURITY_TERMS_VERSION}_`;
const IDENT_DRAFT_PREFIX = "vf_ident_draft_v1_";
const DEMO_USERS_BYPASS = new Set(["demo-admin", "demo-member"]);

export type IdentDocType = "personalausweis" | "reisepass" | "aufenthaltstitel";

export interface SecurityAcceptanceRecord {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  address: string;
  version: string;
  fingerprint: string;
  signaturePng: string;
  acceptedAt: string;
}

export interface SecurityGateDraft {
  step: 1 | 2 | 3;
  address: string;
  pdfDownloaded: boolean;
  signaturePng: string | null;
  checked: boolean;
}

export interface LeaderIdentRecord {
  userId: string;
  fullName: string;
  birthDate: string;
  docType: IdentDocType;
  docNumber: string;
  authority: string;
  address: string;
  frontVerified: boolean;
  backSelfieVerified: boolean;
  liabilityAccepted: boolean;
  gdprStorageConsent?: boolean;
  livenessVerified?: boolean;
  spokenPin?: string;
  videoSha256?: string;
  verifiedAt: string;
  verificationHash: string;
}

export interface LeaderIdentDraft {
  step: 1 | 2 | 3 | 4;
  fullName: string;
  birthDate: string;
  docType: IdentDocType;
  docNumber: string;
  authority: string;
  address: string;
  frontVerified: boolean;
  backSelfieVerified: boolean;
  frontDataUrl: string | null;
  backDataUrl: string | null;
  spokenPin: string;
  videoSha256: string | null;
  videoDataUrl: string;
  liabilityAccepted: boolean;
}

const LEADER_ROLES = new Set(["admin", "teamleiter", "strukturleiter", "mentor", "gebietsmanager"]);

export function isLeaderRole(role?: string | null): boolean {
  return Boolean(role && LEADER_ROLES.has(role.toLowerCase()));
}

export function requiresIdentForAssign(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return LEADER_ROLES.has(normalized) && normalized !== "admin";
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown, both = false): void {
  if (typeof window === "undefined") return;
  try {
    const str = JSON.stringify(value);
    window.sessionStorage.setItem(key, str);
    if (both) window.localStorage.setItem(key, str);
  } catch {
    // ignore storage quota errors
  }
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getGateDraft(userId?: string | null): SecurityGateDraft | null {
  return userId ? readJson<SecurityGateDraft>(`${GATE_DRAFT_PREFIX}${userId}`) : null;
}

export function saveGateDraft(userId: string, draft: SecurityGateDraft): void {
  writeJson(`${GATE_DRAFT_PREFIX}${userId}`, draft, true);
}

export function getIdentDraft(userId?: string | null): LeaderIdentDraft | null {
  return userId ? readJson<LeaderIdentDraft>(`${IDENT_DRAFT_PREFIX}${userId}`) : null;
}

export function saveIdentDraft(userId: string, draft: LeaderIdentDraft): void {
  writeJson(`${IDENT_DRAFT_PREFIX}${userId}`, draft, true);
}

export function getAcceptedTerms(userId?: string | null): SecurityAcceptanceRecord | null {
  return userId ? readJson<SecurityAcceptanceRecord>(`${TERMS_KEY_PREFIX}${userId}`) : null;
}

export function hasAcceptedCurrentTerms(userId?: string | null): boolean {
  if (!userId) return true;
  if (getAcceptedTerms(userId) !== null) return true;
  return DEMO_USERS_BYPASS.has(userId) && (typeof window === "undefined" || window.localStorage.getItem(`vf_force_gate_${userId}`) !== "true");
}

export function saveAcceptedTerms(input: Omit<SecurityAcceptanceRecord, "version" | "fingerprint" | "acceptedAt">): SecurityAcceptanceRecord {
  const record: SecurityAcceptanceRecord = { ...input, version: SECURITY_TERMS_VERSION, fingerprint: getFingerprint(), acceptedAt: new Date().toISOString() };
  writeJson(`${TERMS_KEY_PREFIX}${input.userId}`, record, true);
  removeKey(`${GATE_DRAFT_PREFIX}${input.userId}`);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(SECURITY_CONTRACT_UPDATED_EVENT));
  return record;
}

export function getLeaderIdent(userId?: string | null): LeaderIdentRecord | null {
  return userId ? readJson<LeaderIdentRecord>(`${IDENT_KEY_PREFIX}${userId}`) : null;
}

export function saveLeaderIdent(input: Omit<LeaderIdentRecord, "verifiedAt" | "verificationHash">): LeaderIdentRecord {
  const stamp = `${input.userId}:${input.docNumber}:${Date.now().toString(36).toUpperCase()}`;
  let hash = 0;
  for (let i = 0; i < stamp.length; i++) hash = ((hash << 5) - hash + stamp.charCodeAt(i)) | 0;
  const verificationHash = `KYC-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
  const record: LeaderIdentRecord = { ...input, verifiedAt: new Date().toISOString(), verificationHash };
  writeJson(`${IDENT_KEY_PREFIX}${input.userId}`, record, true);
  removeKey(`${IDENT_DRAFT_PREFIX}${input.userId}`);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(SECURITY_CONTRACT_UPDATED_EVENT));
  return record;
}

export const openSecurityContractModal = () => typeof window !== "undefined" && window.dispatchEvent(new CustomEvent(SECURITY_GATE_OPEN_EVENT));
export const openLeaderIdentModal = () => typeof window !== "undefined" && window.dispatchEvent(new CustomEvent(LEADER_IDENT_OPEN_EVENT));
