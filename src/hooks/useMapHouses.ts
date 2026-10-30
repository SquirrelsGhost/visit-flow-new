import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { hapticFeedback } from "../lib/device/haptics";
import { feedback } from "../lib/feedback/feedback";
import { HOUSES_CHANGED_EVENT } from "../lib/copilot/tools/copilotEvents";
import { fetchMapHousesFromServer, readStoredHouses, writeStoredHouses } from "../lib/map/mapStorage";
import { bestStatus, MAP_STATUSES, type DraftHouse, type MapHouse, type VisitDetails, type VisitStatus } from "../lib/map/mapTypes";
import { doorProducts, saleSummary, type SaleResult } from "../lib/map/saleProducts";
import { newId, pushHouseToServer } from "../lib/map/visitSync";

const labelOf = (status: VisitStatus) => MAP_STATUSES.find((s) => s.key === status)?.label ?? status;

/** Neues Haus aus dem Marker-Entwurf (v1 applyStatus mit Draft). */
export function houseFromDraft(
  draft: DraftHouse,
  status: VisitStatus,
  comment: string,
  details?: VisitDetails,
  sale?: SaleResult,
): MapHouse {
  const now = new Date().toISOString();
  const doorName = (sale?.doorName ?? draft.doorName).trim();
  const products = sale && sale.products.length > 0 ? { products: doorProducts(sale, now) } : {};
  return {
    id: newId(),
    street: draft.street.trim() || "Unbekannte Straße",
    houseNumber: draft.houseNumber.trim() || "1",
    zipCode: draft.zipCode.trim(),
    city: draft.city.trim(),
    type: draft.type,
    latitude: draft.lat,
    longitude: draft.lng,
    status,
    comment: comment.trim() || undefined,
    familyName: doorName || undefined,
    doors: [
      {
        ...details,
        ...products,
        id: newId(),
        name: doorName || (draft.type === "EFH" ? "Haupteingang" : "Wohnung 1"),
        status,
        comment: comment.trim() || undefined,
        timestamp: now,
      },
    ],
    updatedAt: Date.now(),
  };
}

/** Status für ein bestehendes Haus: MFH je Partei, EFH fürs ganze Haus samt Tür (v1 applyStatus). */
export function applyHouseStatus(h: MapHouse, status: VisitStatus, unit: string | null, comment: string): MapHouse {
  const note = comment.trim() || undefined;
  const timestamp = new Date().toISOString();
  if (h.type === "MFH" && unit) {
    const existing = h.doors.find((d) => d.name === unit);
    const door = { ...existing, id: existing?.id ?? newId(), name: unit, status, comment: note ?? existing?.comment, timestamp };
    const doors = [...h.doors.filter((d) => d.name !== unit), door];
    return { ...h, doors, status: bestStatus(doors.map((d) => d.status)), updatedAt: Date.now() };
  }
  const doors = h.doors.map((d) => ({ ...d, status, comment: note ?? d.comment, timestamp }));
  return { ...h, status, doors, comment: note ?? h.comment, updatedAt: Date.now() };
}

/**
 * Eigene Häuser der Karte: lokal sofort sichtbar und gespeichert, danach wie v1 am Server.
 * Klappt das nicht (Funkloch), bleibt `syncPending` stehen und wird beim nächsten Laden nachgeholt.
 */
export function useMapHouses() {
  const [houses, setHouses] = useState<MapHouse[]>(() => readStoredHouses());
  const [saving, setSaving] = useState(false);

  const replace = useCallback((house: MapHouse) => {
    setHouses((prev) => {
      const next = prev.some((h) => h.id === house.id) ? prev.map((h) => (h.id === house.id ? house : h)) : [...prev, house];
      writeStoredHouses(next);
      return next;
    });
  }, []);

  const persist = useCallback(
    async (house: MapHouse) => {
      replace(house);
      const synced = await pushHouseToServer(house);
      replace(synced);
      if (synced.syncPending) toast.warning("Offline gespeichert – wird automatisch nachgeholt");
    },
    [replace],
  );

  // Enes hat einen Termin eingetragen: Stand aus dem Speicher übernehmen
  useEffect(() => {
    const reload = () => setHouses(readStoredHouses());
    window.addEventListener(HOUSES_CHANGED_EVENT, reload);
    return () => window.removeEventListener(HOUSES_CHANGED_EVENT, reload);
  }, []);

  useEffect(() => {
    void fetchMapHousesFromServer().then((list) => {
      setHouses(list);
      writeStoredHouses(list);
      for (const h of list) if (h.syncPending) void pushHouseToServer(h).then(replace);
    });
  }, [replace]);

  const createFromDraft = useCallback(
    async (draft: DraftHouse, status: VisitStatus, comment: string, details?: VisitDetails, sale?: SaleResult) => {
      const house = houseFromDraft(draft, status, comment, details, sale);
      if (sale) feedback("sale");
      else hapticFeedback("light");
      const summary = sale ? saleSummary(sale.products) : "";
      toast.success(summary ? `✓ Verkauf gespeichert: ${summary}` : `${labelOf(status)} · ${house.houseNumber}`);
      setSaving(true);
      try {
        await persist(house);
      } finally {
        setSaving(false);
      }
    },
    [persist],
  );

  const update = useCallback(
    (houseId: string, change: (h: MapHouse) => MapHouse) => {
      const current = houses.find((h) => h.id === houseId);
      if (current) void persist(change(current));
    },
    [houses, persist],
  );

  const updateStatus = useCallback(
    (houseId: string, status: VisitStatus, unit: string | null, comment: string) => {
      update(houseId, (h) => applyHouseStatus(h, status, unit, comment));
      hapticFeedback("light");
      toast.success(unit ? `${unit}: ${labelOf(status)}` : labelOf(status));
    },
    [update],
  );

  const saveFamilyName = useCallback(
    (houseId: string, familyName: string) => {
      update(houseId, (h) => ({ ...h, familyName, doors: h.type === "EFH" ? h.doors.map((d) => ({ ...d, name: familyName || d.name })) : h.doors }));
      toast.success("Familienname gespeichert");
    },
    [update],
  );

  const fixHouseNumber = useCallback(
    (houseId: string, houseNumber: string) => {
      update(houseId, (h) => ({ ...h, houseNumber }));
      toast.success("Hausnummer aktualisiert");
    },
    [update],
  );

  return { houses, saving, createFromDraft, updateStatus, saveFamilyName, fixHouseNumber };
}
