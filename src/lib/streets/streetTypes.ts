/** Wer auf die Straßenliste schaut: Admin alles, Strukturleiter die eigene Gruppe, Mentor die Mentees (wie v1). */
export type StreetView = "admin" | "struktur" | "mentor";

export type StreetTab = "deletions" | "streets" | "activity";

/** v1: einzelnes Datum (Standard heute), Zeitraum oder ohne Datum. */
export type StreetDateMode = "day" | "range" | "all";

export interface StreetDateFilter {
  mode: StreetDateMode;
  /** JJJJ-MM-TT; bei "day" sind beide gleich. */
  from: string;
  to: string;
}

/** Türstatus, vereinfacht wie v1 getStatusDisplay. */
export type StreetStatus = "sale" | "termin" | "kein" | "versorgt" | "na" | "storno" | "approved";

export interface StreetProduct {
  category: string;
  quantity: number;
}

/** Eine Person, die Türen erfassen oder eine Straße bekommen kann. */
export interface StreetPerson {
  id: string;
  name: string;
  role: string;
  /** v1 strukturleiterGroupName (eigene Gruppen des Strukturleiters). */
  group?: string;
}

/** Tür aus v1 /doors/admin/all, /strukturleiter/doors oder /doors/team/:id. */
export interface RawDoor {
  id: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  status: string;
  userId: string;
  userName?: string;
  /** Name der Bewohner (v1 door.name). */
  customerName: string;
  timestamp: string;
}

/** Verkauf aus v1 /products/admin/all, /strukturleiter/products oder /products/team/:id. */
export interface RawProduct {
  doorId: string;
  userId: string;
  category: string;
  quantity: number;
  timestamp: string;
  commissionEuro: number;
}

export interface StreetDoor {
  id: string;
  houseNumber: string;
  status: StreetStatus;
  memberId: string;
  memberName: string;
  customerName: string;
  timestamp: string;
  products: StreetProduct[];
}

export interface StreetRow {
  key: string;
  zipCode: string;
  city: string;
  street: string;
  doors: StreetDoor[];
  sales: number;
  memberNames: string[];
}

/** Straßen eines Orts ("PLZ Ort"), wie v1 groupedByZipCity. */
export interface StreetPlace {
  key: string;
  rows: StreetRow[];
}

export interface StreetData {
  doors: RawDoor[];
  products: RawProduct[];
}

/** Tür auf der Warteliste zum Löschen (v1 /doors/admin/pending-deletions). */
export interface PendingDoor {
  id: string;
  name: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  status: string;
  ownerName: string;
  requestedByName: string;
  requestedAt: string;
}

export interface AddressPatch {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
}

/** Ergebnis einer Sammel-Aktion (Bearbeiten, Löschen): wie viele gingen durch. */
export interface BatchResult {
  ok: string[];
  failed: number;
}
