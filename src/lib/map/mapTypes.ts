import type { Vertical } from "../battle/battleCategories";
import type { ProductCategory } from "./productMeta";

export type VisitStatus =
  | "Angetroffen → Termin"
  | "Angetroffen → Sale"
  | "Angetroffen → Versorgt"
  | "Angetroffen → Kein Interesse"
  | "N/A"
  | "Approved"
  | "Storno";

export type HouseType = "EFH" | "MFH";

/** Zusatzangaben aus den Status-Dialogen (v1 SaleDialog/Termin/Versorgt/Nicht angetroffen). */
export interface VisitDetails {
  comment?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentType?: string;
  suppliedUntilDate?: string;
  customerType?: string;
  /** Solar-Lead (v1 Lead-Formular) */
  email?: string;
  phone?: string;
}

/** Verkauftes Produkt an der Tür, wie v1 es an /products/bulk schickt. */
export interface DoorProduct {
  id: string;
  category: ProductCategory;
  subCategory: string;
  type: string;
  quantity: number;
  isPointRelevant: boolean;
  isPremium: boolean;
  vertical: Vertical;
  notes?: string;
  details?: Record<string, string | number | boolean>;
  timestamp: string;
}

export interface MapDoor extends VisitDetails {
  id: string;
  name: string;
  status: VisitStatus;
  timestamp: string;
  products?: DoorProduct[];
}

export interface MapHouse {
  id: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  type: HouseType;
  latitude: number;
  longitude: number;
  status: VisitStatus | "offen";
  comment?: string;
  familyName?: string;
  doors: MapDoor[];
  updatedBy?: string;
  updatedAt?: number;
  isTeam?: boolean;
  /** v1-Datensätze (Address → House → Visit → Door), damit der Server dasselbe Haus wiedererkennt. */
  addressId?: string;
  visitId?: string;
  /** Speichern am Server ist fehlgeschlagen und wird beim nächsten Laden nachgeholt. */
  syncPending?: boolean;
}

export interface MapArea {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  geojson: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

export interface AddressSuggestion {
  label: string;
  lng: number;
  lat: number;
}

export interface DraftHouse {
  lng: number;
  lat: number;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  type: HouseType;
  doorName: string;
}

export interface GeofenceState {
  status: "inside_own" | "inside_other" | "outside_all" | "unknown";
  areaName?: string;
  managerName?: string;
}

export interface TeamMemberOption {
  id: string;
  name: string;
  role: string;
}

export interface StatusDefinition {
  key: VisitStatus;
  label: string;
  color: string;
}

export const MAP_STATUSES: StatusDefinition[] = [
  { key: "Angetroffen → Termin", label: "Termin", color: "#3b82f6" },
  { key: "Angetroffen → Sale", label: "Abschluss", color: "#22c55e" },
  { key: "Angetroffen → Versorgt", label: "Versorgt", color: "#06b6d4" },
  { key: "Angetroffen → Kein Interesse", label: "Kein Interesse", color: "#ef4444" },
  { key: "N/A", label: "Nicht angetr.", color: "#9aa6b8" },
  { key: "Approved", label: "Approved", color: "#0d9488" },
  { key: "Storno", label: "Storno", color: "#f97316" },
];

export const OFFEN_COLOR = "#64748b";
export const PREDEFINED_UNITS = ["EG li.", "EG re.", "1. OG li.", "1. OG re.", "2. OG li.", "2. OG re.", "DG"];

const STATUS_PRIO: Record<VisitStatus, number> = {
  Approved: 7,
  Storno: 6,
  "Angetroffen → Sale": 5,
  "Angetroffen → Termin": 4,
  "Angetroffen → Versorgt": 3,
  "Angetroffen → Kein Interesse": 2,
  "N/A": 1,
};

export function colorForStatus(status?: VisitStatus | "offen"): string {
  return MAP_STATUSES.find((s) => s.key === status)?.color ?? OFFEN_COLOR;
}

export function statusLabel(status: VisitStatus | "offen", vertical: Vertical): string {
  if (status === "Angetroffen → Versorgt" && vertical === "solar") return "Unpassend";
  if (status === "offen") return "Offen";
  return MAP_STATUSES.find((s) => s.key === status)?.label ?? status;
}

export function bestStatus(statuses: VisitStatus[]): VisitStatus {
  return statuses.reduce<VisitStatus>((best, cur) => (STATUS_PRIO[cur] > STATUS_PRIO[best] ? cur : best), "N/A");
}

export function relTime(ts?: number): string {
  if (!ts) return "";
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}. um ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr`;
}
