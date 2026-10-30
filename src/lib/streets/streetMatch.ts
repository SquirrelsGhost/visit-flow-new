/** Straßen zwischen Straßenliste und CRM erkennen; ohne Abhängigkeiten, damit jede Logik es nutzen kann. */

/** Eine Straße als Ziel einer Verknüpfung zwischen Straßenliste und CRM; PLZ und Ort dürfen fehlen. */
export interface StreetRef {
  street: string;
  zipCode: string;
  city: string;
}

/** Query-Parameter beider Richtungen: /crm?strasse=Lindenstraße&plz=50667&ort=Köln */
export const STREET_PARAMS = { street: "strasse", zipCode: "plz", city: "ort" } as const;

type ParamReader = { get: (name: string) => string | null };

const clean = (value: string | null | undefined) => (value ?? "").trim();
const norm = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ").replace(/str\.$/, "straße").replace(/strasse$/, "straße");

export function streetQuery(ref: StreetRef): string {
  const params = new URLSearchParams({ [STREET_PARAMS.street]: ref.street });
  if (ref.zipCode) params.set(STREET_PARAMS.zipCode, ref.zipCode);
  if (ref.city) params.set(STREET_PARAMS.city, ref.city);
  return params.toString();
}

export function streetRefFromParams(params: ParamReader): StreetRef | null {
  const street = clean(params.get(STREET_PARAMS.street));
  if (!street) return null;
  return { street, zipCode: clean(params.get(STREET_PARAMS.zipCode)), city: clean(params.get(STREET_PARAMS.city)) };
}

/** Hausnummer am Ende ("12", "12a", "12 - 14", "3/1"). */
const HOUSE_NUMBER = /\s+\d+\s*[a-zA-Z]?(\s*[-/]\s*\d+\s*[a-zA-Z]?)?$/;

/** Straße aus einer CRM-Adresse ("Lindenstraße 4, 50667 Köln"); null ohne Straße. */
export function streetRefOfAddress(address: string): StreetRef | null {
  const [line = "", place = ""] = address.split(",").map((part) => part.trim());
  const street = line.replace(HOUSE_NUMBER, "").trim();
  if (!street || /^\d/.test(street)) return null;
  const zip = /^(\d{4,5})\b\s*(.*)$/.exec(place);
  return { street, zipCode: zip?.[1] ?? "", city: zip ? zip[2].trim() : place };
}

/** Gleiche Straße: Name ohne Groß-/Kleinschreibung, PLZ bzw. Ort nur, wenn beide Seiten sie kennen. */
export function sameStreet(a: StreetRef, b: StreetRef): boolean {
  if (norm(a.street) !== norm(b.street)) return false;
  if (a.zipCode && b.zipCode) return a.zipCode === b.zipCode;
  if (a.city && b.city) return norm(a.city) === norm(b.city);
  return true;
}

/** Liegt die Adresse eines Verkaufs in der Straße? Ohne Straßenfilter immer ja. */
export function onStreet(address: string, ref: StreetRef | null | undefined): boolean {
  if (!ref) return true;
  const own = streetRefOfAddress(address);
  return own !== null && sameStreet(own, ref);
}

