import type { IdentDocType } from "./securityContractStore";

export type IdentStep = 1 | 2 | 3 | 4;
export const IDENT_STEP_COUNT = 4;

export interface IdentPersonalData {
  fullName: string;
  birthDate: string;
  docType: IdentDocType;
  docNumber: string;
  authority: string;
  address: string;
}

export type IdentField = Exclude<keyof IdentPersonalData, "docType">;
export const IDENT_FIELDS: readonly IdentField[] = ["fullName", "birthDate", "docNumber", "authority", "address"];

/** Mindestlängen wie bisher; das Geburtsdatum wird zusätzlich auf Volljährigkeit geprüft. */
const MIN_LENGTH: Record<IdentField, number> = { fullName: 3, birthDate: 6, docNumber: 5, authority: 3, address: 8 };
const ADULT_YEARS = 18;

export type IdentFieldError = "required" | "tooShort" | "future" | "underage" | null;

function birthDateError(value: string, today: Date): IdentFieldError {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "tooShort";
  if (date > today) return "future";
  const adult = new Date(date);
  adult.setFullYear(adult.getFullYear() + ADULT_YEARS);
  return adult > today ? "underage" : null;
}

export function identFieldError(field: IdentField, value: string, today = new Date()): IdentFieldError {
  const trimmed = value.trim();
  if (!trimmed) return "required";
  if (trimmed.length < MIN_LENGTH[field]) return "tooShort";
  return field === "birthDate" ? birthDateError(trimmed, today) : null;
}

export function isPersonalDataValid(data: IdentPersonalData): boolean {
  return IDENT_FIELDS.every((field) => identFieldError(field, data[field]) === null);
}

export function firstInvalidField(data: IdentPersonalData): IdentField | null {
  return IDENT_FIELDS.find((field) => identFieldError(field, data[field]) !== null) ?? null;
}
