import type { TakeoverData, TakeoverParty } from "./formTypes";

/** Vodafone-Formularseite, die v1 nach dem Erstellen öffnet (mit Vorbelegung, soweit Vodafone sie annimmt). */
export const VODAFONE_TAKEOVER_URL = "https://www.vodafone.de/hilfe/formulare/38";

const emptyParty = (): TakeoverParty => ({ name: "", firstName: "", street: "", houseNumber: "", zip: "", city: "" });

export function emptyTakeover(): TakeoverData {
  return {
    customerNumber: "",
    previous: emptyParty(),
    deceased: false,
    previousSignature: null,
    next: emptyParty(),
    salutation: "",
    birthYear: "",
    phone: "",
    email: "",
    timing: "asap",
    date: "",
    bankHolder: "",
    iban: "",
    bic: "",
    nextSignature: null,
  };
}

/** Vollständiger Name "Vorname Name". */
export function fullName(party: TakeoverParty): string {
  return `${party.firstName} ${party.name}`.trim();
}

export type TakeoverProblem = "customerNumber" | "previousName" | "nextName" | "date" | "iban";

const IBAN = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

/** IBAN ohne Leerzeichen, groß geschrieben. */
export function compactIban(iban: string): string {
  return iban.replace(/\s+/g, "").toUpperCase();
}

/** Erstes Problem, das das Erstellen verhindert; v1 prüfte nichts, das PDF wäre dann unbrauchbar. */
export function takeoverProblem(data: TakeoverData): TakeoverProblem | null {
  if (!data.customerNumber.trim()) return "customerNumber";
  if (!data.previous.name.trim()) return "previousName";
  if (!data.next.name.trim()) return "nextName";
  if (data.timing === "date" && !data.date) return "date";
  if (data.iban.trim() && !IBAN.test(compactIban(data.iban))) return "iban";
  return null;
}

export function takeoverFileName(data: TakeoverData): string {
  return `Vertragsuebernahme_${data.customerNumber.trim() || "VF"}.pdf`;
}

/** Vodafone-Seite mit denselben Vorbelegungs-Parametern wie v1. */
export function vodafoneTakeoverLink(data: TakeoverData): string {
  const params = new URLSearchParams();
  const add = (keys: readonly string[], value: string) => {
    if (value.trim()) keys.forEach((key) => params.append(key, value.trim()));
  };
  const street = `${data.previous.street} ${data.previous.houseNumber}`.trim();
  add(["kundennummer"], data.customerNumber);
  add(["vorname"], data.previous.firstName);
  add(["nachname"], data.previous.name);
  add(["strasse", "street"], street);
  add(["plz", "zip"], data.previous.zip);
  add(["ort", "city"], data.previous.city);
  add(["email"], data.email);
  add(["telefon", "phone"], data.phone);
  const query = params.toString();
  return query ? `${VODAFONE_TAKEOVER_URL}?${query}` : VODAFONE_TAKEOVER_URL;
}
