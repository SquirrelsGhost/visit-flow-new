import { randomUUID } from "node:crypto";
import { demoExpiring } from "@/lib/expiring/expiringDemoStore";
import type { StoredRecord } from "./store/RecordStore";
import { SqlDoorsRepo, type VfDoorRecord } from "./store/sqlDoorsRepo";
import { SqlSalesRepo, type VfSaleRecord } from "./store/sqlSalesRepo";
import { createStore } from "./store/storeFactory";

export interface MapAreaRecord extends StoredRecord {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  geojson: { type: "Polygon"; coordinates: [number, number][][] };
  receivedAt: string;
}

const areaStore = () => createStore<MapAreaRecord>("streets-assignments");
const expiringStore = () => createStore<StoredRecord & Record<string, unknown>>("expiring-contracts");

function doorToRaw(d: VfDoorRecord) {
  return {
    id: d.id,
    _id: d.id,
    userId: d.userId,
    teamId: d.teamId,
    street: d.street,
    houseNumber: d.houseNumber,
    zipCode: d.postalCode ?? "",
    city: d.city ?? "",
    latitude: d.lat,
    longitude: d.lng,
    lat: d.lat,
    lng: d.lng,
    status: d.status,
    vertical: d.vertical ?? "telco",
    name: String(d.details?.name ?? d.details?.customerName ?? ""),
    customerName: String(d.details?.customerName ?? d.details?.name ?? ""),
    userName: String(d.details?.userName ?? "Berater"),
    by: String(d.details?.userName ?? "Berater"),
    comment: String(d.details?.comment ?? ""),
    timestamp: d.receivedAt,
    createdAt: d.receivedAt,
    ts: d.receivedAt,
    ...d.details,
  };
}

function saleToRaw(s: VfSaleRecord) {
  return {
    id: s.id,
    _id: s.id,
    userId: s.userId,
    teamId: s.teamId,
    doorId: s.doorId ?? "",
    status: s.status,
    category: s.category,
    type: s.productName,
    productName: s.productName,
    provider: s.provider ?? "",
    commissionEuro: s.commissionCents / 100,
    commission_euro: s.commissionCents / 100,
    quantity: Number(s.customerData?.quantity ?? 1) || 1,
    vertical: String(s.customerData?.vertical ?? s.category ?? "telco"),
    isPointRelevant: s.customerData?.isPointRelevant !== false,
    excludedFromBattle: s.customerData?.excludedFromBattle === true,
    timestamp: s.receivedAt,
    createdAt: s.receivedAt,
    created_at: s.receivedAt,
    ...s.customerData,
  };
}

export class DoorsAndCrmDatabaseService {
  static async listDoors(filter?: { userId?: string; teamId?: string; startDate?: string; endDate?: string }) {
    const all = await SqlDoorsRepo.listAll({ userId: filter?.userId, teamId: filter?.teamId });
    return all
      .filter((d) => {
        const day = d.receivedAt.slice(0, 10);
        if (filter?.startDate && day < filter.startDate) return false;
        if (filter?.endDate && day > filter.endDate) return false;
        return d.details?.pendingDeletion !== true;
      })
      .map(doorToRaw);
  }

  static async upsertDoorsBulk(
    rawDoors: Record<string, unknown>[],
    userId: string,
    userName: string,
    teamId?: string,
    allowCustomOwner = false,
  ) {
    const now = new Date().toISOString();
    for (const raw of rawDoors) {
      const id = String(raw.id ?? raw._id ?? randomUUID());
      const existing = await SqlDoorsRepo.getById(id);
      const resolvedUserId = allowCustomOwner
        ? String(raw.userId ?? existing?.userId ?? userId)
        : String(existing?.userId ?? userId);
      const resolvedTeamId = allowCustomOwner
        ? String(raw.teamId ?? existing?.teamId ?? teamId ?? "")
        : String(existing?.teamId ?? teamId ?? "");
      await SqlDoorsRepo.upsert({
        id,
        userId: resolvedUserId,
        teamId: resolvedTeamId,
        street: String(raw.street ?? existing?.street ?? ""),
        houseNumber: String(raw.houseNumber ?? existing?.houseNumber ?? ""),
        postalCode: String(raw.zipCode ?? raw.postalCode ?? existing?.postalCode ?? ""),
        city: String(raw.city ?? existing?.city ?? ""),
        lat: Number(raw.latitude ?? raw.lat ?? existing?.lat ?? 51.2277),
        lng: Number(raw.longitude ?? raw.lng ?? existing?.lng ?? 6.7735),
        status: String(raw.status ?? existing?.status ?? "N/A"),
        vertical: String(raw.vertical ?? existing?.vertical ?? "telco"),
        details: {
          ...existing?.details,
          ...raw,
          userId: resolvedUserId,
          teamId: resolvedTeamId,
          userName: String(
            allowCustomOwner
              ? (raw.userName ?? existing?.details?.userName ?? userName)
              : (existing?.details?.userName ?? userName),
          ),
        },
        receivedAt: String(raw.timestamp ?? existing?.receivedAt ?? now),
        updatedAt: now,
      });
    }
    return { synced: rawDoors.length };
  }

  static async updateDoor(id: string, patch: Record<string, unknown>) {
    const existing = await SqlDoorsRepo.getById(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    return SqlDoorsRepo.upsert({
      ...existing,
      street: typeof patch.street === "string" ? patch.street : existing.street,
      houseNumber: typeof patch.houseNumber === "string" ? patch.houseNumber : existing.houseNumber,
      postalCode: typeof patch.zipCode === "string" ? patch.zipCode : existing.postalCode,
      city: typeof patch.city === "string" ? patch.city : existing.city,
      status: typeof patch.status === "string" ? patch.status : existing.status,
      details: { ...existing.details, ...patch },
      updatedAt: now,
    });
  }

  static async deleteDoor(id: string) {
    await SqlDoorsRepo.removeByIds([id]);
    return { deleted: true };
  }

  static async assignStreet(userId: string, street: string, zipCode: string, city: string) {
    const all = await SqlDoorsRepo.listAll();
    const matching = all.filter(
      (d) =>
        d.street.toLowerCase() === street.trim().toLowerCase() &&
        (!city || (d.city ?? "").toLowerCase() === city.trim().toLowerCase()),
    );
    const now = new Date().toISOString();
    for (const d of matching) {
      await SqlDoorsRepo.upsert({
        ...d,
        userId,
        postalCode: zipCode || d.postalCode,
        city: city || d.city,
        updatedAt: now,
      });
    }
    return { updatedCount: matching.length };
  }

  static async listPendingDeletions() {
    const all = await SqlDoorsRepo.listAll();
    return all
      .filter((d) => d.details?.pendingDeletion === true)
      .map((d) => ({
        id: d.id,
        name: String(d.details?.name ?? ""),
        street: d.street,
        houseNumber: d.houseNumber,
        zipCode: d.postalCode ?? "",
        city: d.city ?? "",
        status: d.status,
        ownerName: String(d.details?.userName ?? ""),
        requestedByName: String(d.details?.requestedByName ?? ""),
        requestedAt: d.updatedAt,
      }));
  }

  static async resolveDeletion(id: string, action: "approve" | "reject") {
    if (action === "approve") {
      await SqlDoorsRepo.removeByIds([id]);
      return true;
    }
    const existing = await SqlDoorsRepo.getById(id);
    if (!existing) return false;
    await SqlDoorsRepo.upsert({
      ...existing,
      details: { ...existing.details, pendingDeletion: false },
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  static async listAreas() {
    return areaStore().list();
  }

  static async saveArea(id: string | undefined, input: Record<string, unknown>) {
    const now = new Date().toISOString();
    const record: MapAreaRecord = {
      id: id || `area-${randomUUID().slice(0, 8)}`,
      name: String(input.name ?? "Revier"),
      description: typeof input.description === "string" ? input.description : undefined,
      manager_id: typeof input.manager_id === "string" ? input.manager_id : undefined,
      geojson: (input.geojson as MapAreaRecord["geojson"]) ?? { type: "Polygon", coordinates: [] },
      receivedAt: now,
    };
    return areaStore().upsert(record);
  }

  static async listSales(filter?: { userId?: string; teamId?: string; startDate?: string; endDate?: string }) {
    const all = await SqlSalesRepo.listAll({ userId: filter?.userId, teamId: filter?.teamId });
    return all
      .filter((s) => {
        const day = s.receivedAt.slice(0, 10);
        if (filter?.startDate && day < filter.startDate) return false;
        if (filter?.endDate && day > filter.endDate) return false;
        return true;
      })
      .map(saleToRaw);
  }

  static async upsertProductsBulk(
    rawProducts: Record<string, unknown>[],
    userId: string,
    teamId?: string,
    allowCustomOwner = false,
  ) {
    const now = new Date().toISOString();
    for (const raw of rawProducts) {
      const id = String(raw.id ?? raw._id ?? randomUUID());
      const existing = await SqlSalesRepo.getById(id);
      const euro = Number(raw.commissionEuro ?? raw.commission_euro ?? 0) || 0;
      const resolvedUserId = allowCustomOwner
        ? String(raw.userId ?? existing?.userId ?? userId)
        : String(existing?.userId ?? userId);
      const resolvedTeamId = allowCustomOwner
        ? String(raw.teamId ?? existing?.teamId ?? teamId ?? "")
        : String(existing?.teamId ?? teamId ?? "");
      await SqlSalesRepo.upsert({
        id,
        userId: resolvedUserId,
        teamId: resolvedTeamId,
        doorId: String(raw.doorId ?? existing?.doorId ?? ""),
        status: String(raw.status ?? existing?.status ?? "pending"),
        category: String(raw.category ?? existing?.category ?? "telco"),
        provider: String(raw.provider ?? existing?.provider ?? "Vodafone"),
        productName: String(raw.productName ?? raw.type ?? raw.name ?? existing?.productName ?? "Tarif"),
        commissionCents: Math.round(euro * 100) || existing?.commissionCents || 0,
        contractExpiresAt:
          typeof raw.contractExpiresAt === "string" ? raw.contractExpiresAt : existing?.contractExpiresAt,
        customerData: {
          ...existing?.customerData,
          ...raw,
          userId: resolvedUserId,
          teamId: resolvedTeamId,
        },
        receivedAt: String(raw.timestamp ?? raw.createdAt ?? existing?.receivedAt ?? now),
        updatedAt: now,
      });
    }
    return { synced: rawProducts.length };
  }

  static async setSaleStatus(id: string, status: string, reason?: string) {
    const existing = await SqlSalesRepo.getById(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    return SqlSalesRepo.upsert({
      ...existing,
      status,
      customerData: {
        ...existing.customerData,
        status,
        ...(reason ? { cancelReason: reason } : {}),
      },
      updatedAt: now,
    });
  }

  static async toggleBattleExclude(id: string, excluded: boolean) {
    const existing = await SqlSalesRepo.getById(id);
    if (!existing) return null;
    return SqlSalesRepo.upsert({
      ...existing,
      customerData: { ...existing.customerData, excludedFromBattle: excluded },
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteSale(id: string) {
    await SqlSalesRepo.removeByIds([id]);
    return { deleted: true };
  }

  static async listExpiringContracts() {
    const stored = await expiringStore().list();
    if (stored.length > 0) return stored;
    const seeded = demoExpiring();
    for (const c of seeded) {
      await expiringStore().upsert({
        ...c,
        id: c.id,
        receivedAt: new Date().toISOString(),
      });
    }
    return seeded;
  }

  static async assignExpiringAdvisor(contractId: string, advisorId: string | null) {
    await DoorsAndCrmDatabaseService.listExpiringContracts();
    const updatedExpiring = await expiringStore().update(contractId, (curr) => ({
      ...curr,
      userId: advisorId ?? curr.userId,
      assignedAdvisorId: advisorId ?? undefined,
    }));
    const existingSale = await SqlSalesRepo.getById(contractId);
    if (existingSale) {
      const nextUserId = advisorId ?? existingSale.userId;
      const updatedSale = await SqlSalesRepo.upsert({
        ...existingSale,
        userId: nextUserId,
        customerData: {
          ...existingSale.customerData,
          userId: nextUserId,
          assignedAdvisorId: advisorId ?? undefined,
        },
        updatedAt: new Date().toISOString(),
      });
      return updatedExpiring ?? {
        ...saleToRaw(updatedSale),
        assignedAdvisorId: advisorId ?? undefined,
      };
    }
    return updatedExpiring;
  }
}
