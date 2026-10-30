import { randomUUID } from "node:crypto";
import { demoUpload } from "@/lib/abrechnung/abrechnungDemoStore";
import { recalcTotals } from "@/lib/abrechnung/abrechnungRecalc";
import type { AbrechnungCategory, AbrechnungItem, AbrechnungRecord } from "@/lib/abrechnung/abrechnungTypes";
import type { StoredRecord } from "./store/RecordStore";
import { createStore } from "./store/storeFactory";

export interface StoredAbrechnungRecord extends AbrechnungRecord, StoredRecord {
  id: string;
  userId: string;
  receivedAt: string;
}

const abrechnungStore = () => createStore<StoredAbrechnungRecord>("abrechnungen");

export class AbrechnungDatabaseService {
  static async listAll(userId?: string, category?: AbrechnungCategory): Promise<AbrechnungRecord[]> {
    const all = await abrechnungStore().list();
    return all.filter((r) => {
      if (userId && r.userId !== userId) return false;
      if (category && (r.category ?? "vodafone") !== category) return false;
      return true;
    });
  }

  static async getMonth(
    userId: string,
    category: AbrechnungCategory,
    month: number,
    year: number,
  ): Promise<AbrechnungRecord | null> {
    const all = await AbrechnungDatabaseService.listAll(userId, category);
    return all.find((r) => r.month === month && r.year === year) ?? null;
  }

  static async listOpenItems(userId: string, category: AbrechnungCategory): Promise<AbrechnungItem[]> {
    const records = await AbrechnungDatabaseService.listAll(userId, category);
    const items: AbrechnungItem[] = [];
    for (const r of records) {
      for (const item of r.items) {
        if (item.status !== "matched" && item.status !== "cross_matched") {
          items.push({ ...item, recordId: r._id, billingMonth: r.month, billingYear: r.year });
        }
      }
    }
    return items;
  }

  static async listReklamationen(userId: string, category: AbrechnungCategory): Promise<AbrechnungItem[]> {
    const records = await AbrechnungDatabaseService.listAll(userId, category);
    const items: AbrechnungItem[] = [];
    for (const r of records) {
      for (const item of r.items) {
        if (item.reklamiert) {
          items.push({ ...item, recordId: r._id, billingMonth: r.month, billingYear: r.year });
        }
      }
    }
    return items;
  }

  static async upload(
    userId: string,
    category: AbrechnungCategory,
    month: number,
    year: number,
    fileName: string | null,
    totalAmountPdf?: number,
  ): Promise<{ record: AbrechnungRecord; parsedItemCount: number }> {
    const { record: built } = demoUpload(category, { month, year }, fileName, totalAmountPdf);
    const id = built._id || `abr-${randomUUID().slice(0, 10)}`;
    const now = new Date().toISOString();
    const stored: StoredAbrechnungRecord = {
      ...built,
      _id: id,
      id,
      userId,
      receivedAt: now,
    };
    await abrechnungStore().upsert(stored);
    return { record: stored, parsedItemCount: stored.items.length };
  }

  static async deleteById(id: string): Promise<boolean> {
    const count = await abrechnungStore().removeWhere((r) => r.id === id || r._id === id);
    return count > 0;
  }

  static async patchItems(
    recordId: string,
    itemIds: string[],
    transform: (item: AbrechnungItem) => AbrechnungItem | null,
  ): Promise<AbrechnungRecord | null> {
    const idSet = new Set(itemIds);
    const updater = (curr: StoredAbrechnungRecord): StoredAbrechnungRecord => {
      const nextItems: AbrechnungItem[] = [];
      for (const item of curr.items) {
        if (!idSet.has(item._id)) {
          nextItems.push(item);
        } else {
          const changed = transform(item);
          if (changed) nextItems.push(changed);
        }
      }
      const recalculated = recalcTotals({ ...curr, items: nextItems });
      return { ...curr, ...recalculated };
    };
    const updated = await abrechnungStore().update(recordId, updater);
    if (updated) return updated;
    const all = await abrechnungStore().list();
    const byAltId = all.find((r) => r._id === recordId || r.id === recordId);
    if (!byAltId) return null;
    return abrechnungStore().update(byAltId.id, updater);
  }

  static async resolveReklamationenBulk(itemIds: string[]): Promise<number> {
    const idSet = new Set(itemIds);
    const all = await abrechnungStore().list();
    let updatedCount = 0;
    for (const rec of all) {
      if (rec.items.some((i) => idSet.has(i._id))) {
        await AbrechnungDatabaseService.patchItems(rec.id, itemIds, (i) => ({
          ...i,
          reklamationResolved: true,
        }));
        updatedCount++;
      }
    }
    return updatedCount;
  }
}
