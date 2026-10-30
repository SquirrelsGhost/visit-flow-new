import type { AuthUser } from "@/shared/auth/authSchemas";
import type { ChangeArea, ChangeData } from "./formTypes";

/** Reihenfolge der Bereiche wie im PDF. */
export const CHANGE_AREAS: readonly ChangeArea[] = ["name", "address", "contact", "bank", "tax", "other"];

/** Kästchen im PDF je Bereich. */
export const CHANGE_CHECKBOX: Record<ChangeArea, string> = {
  name: "Name",
  address: "Adresse",
  contact: "TelefonEMail",
  bank: "Bankverbindung",
  tax: "Steuernr Finanzamt",
  other: "Sonstiges",
};

/** Eingabefelder je Bereich; "wide" belegt die ganze Zeile. Die Anrede hat ihre eigene Auswahl. */
export type ChangeTextField = Exclude<keyof ChangeData, "areas" | "salutation" | "vpkn" | "firstName" | "lastName">;
export interface ChangeFieldDef {
  key: ChangeTextField;
  wide?: boolean;
  type?: "email" | "tel";
}

export const CHANGE_FIELDS: Record<ChangeArea, readonly ChangeFieldDef[]> = {
  name: [{ key: "company", wide: true }, { key: "newFirstName" }, { key: "newLastName" }],
  address: [{ key: "street", wide: true }, { key: "zipCity", wide: true }],
  contact: [{ key: "phone", type: "tel" }, { key: "mobile", type: "tel" }, { key: "email", wide: true, type: "email" }],
  bank: [{ key: "accountHolder", wide: true }, { key: "iban", wide: true }, { key: "bic" }, { key: "bank" }],
  tax: [{ key: "taxOffice", wide: true }, { key: "taxNumber" }, { key: "vatId" }],
  other: [{ key: "otherText", wide: true }],
};

function text(user: AuthUser | null, key: string): string {
  const value = user?.[key];
  return typeof value === "string" ? value : "";
}

/** Leere Änderungsmitteilung; VPKN, Name und E-Mail kommen wie in v1 aus dem angemeldeten Benutzer. */
export function emptyChange(user: AuthUser | null): ChangeData {
  const fullName = text(user, "displayName") || text(user, "name");
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    vpkn: text(user, "vpkn"),
    firstName,
    lastName: rest.join(" "),
    areas: [],
    salutation: "",
    company: "",
    newFirstName: "",
    newLastName: "",
    street: "",
    zipCity: "",
    phone: "",
    mobile: "",
    email: text(user, "email"),
    accountHolder: "",
    iban: "",
    bic: "",
    bank: "",
    taxOffice: "",
    taxNumber: "",
    vatId: "",
    otherText: "",
  };
}

/** Schaltet einen Bereich an oder aus, Reihenfolge bleibt wie im PDF. */
export function toggleArea(areas: readonly ChangeArea[], area: ChangeArea): ChangeArea[] {
  const next = areas.includes(area) ? areas.filter((a) => a !== area) : [...areas, area];
  return CHANGE_AREAS.filter((a) => next.includes(a));
}

export type ChangeProblem = "noArea" | "noIdentity";

/** Was vor dem Erstellen fehlt: mindestens ein Bereich (wie v1) und wer die Änderung meldet. */
export function changeProblem(data: ChangeData): ChangeProblem | null {
  if (data.areas.length === 0) return "noArea";
  if (!data.vpkn.trim() && !data.lastName.trim()) return "noIdentity";
  return null;
}

export function changeFileName(data: ChangeData): string {
  return `Aenderungsmitteilung_${data.vpkn.trim() || "VF"}.pdf`;
}
