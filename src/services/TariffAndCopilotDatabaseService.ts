import { randomUUID } from "node:crypto";
import type { CoachMemory, CoachMemoryKind } from "@/lib/copilot/coachMemoryApi";
import { demoEnergyTariffs } from "@/lib/energy/energyDemoTariffs";
import type { EmailReport } from "@/lib/settings/userSettings";
import { DEMO_TARIFFS } from "@/lib/simulator/simulatorDemo";
import type { TariffCategory } from "@/lib/tariff/tariffTypes";
import type { StoredRecord } from "./store/RecordStore";
import { createStore } from "./store/storeFactory";

interface StoredCoachMemoryRecord extends CoachMemory, StoredRecord {
  id: string;
  userId: string;
  receivedAt: string;
}

interface StoredEmailReportRecord extends StoredRecord {
  id: string;
  userId: string;
  settings: EmailReport;
  receivedAt: string;
}

const memoryStore = () => createStore<StoredCoachMemoryRecord>("coach-memory");
const emailReportStore = () => createStore<StoredEmailReportRecord>("email-reports");

export class TariffAndCopilotDatabaseService {
  static getGroupedSimulatorTariffs() {
    return DEMO_TARIFFS;
  }

  static refineCommissions(products: { category?: string; type?: string; quantity?: number }[]) {
    return {
      perProduct: products.map((p) => {
        const rawQty = p.quantity === undefined ? 1 : Number(p.quantity);
        const qty = Number.isFinite(rawQty) ? Math.max(0, rawQty) : 0;
        return {
          commission: qty * 85,
        };
      }),
    };
  }

  static getTariffsByCategory(category: TariffCategory) {
    return demoEnergyTariffs(category);
  }

  static async listMemories(userId: string): Promise<CoachMemory[]> {
    const all = await memoryStore().list();
    return all
      .filter((m) => m.userId === userId)
      .map(({ id, kind, content, source, createdAt }) => ({ id, kind, content, source, createdAt }));
  }

  static async addMemory(
    userId: string,
    kind: CoachMemoryKind,
    content: string,
    source: "user" | "enes" = "enes",
  ): Promise<CoachMemory> {
    const now = new Date().toISOString();
    const record: StoredCoachMemoryRecord = {
      id: `mem-${randomUUID().slice(0, 8)}`,
      userId,
      kind,
      content,
      source,
      createdAt: now,
      receivedAt: now,
    };
    await memoryStore().upsert(record);
    return {
      id: record.id,
      kind: record.kind,
      content: record.content,
      source: record.source,
      createdAt: record.createdAt,
    };
  }

  static async deleteMemory(userId: string, id: string): Promise<boolean> {
    const removed = await memoryStore().removeWhere((m) => m.userId === userId && m.id === id);
    return removed > 0;
  }

  static async clearMemories(userId: string): Promise<{ memories: number; conversations: number }> {
    const memories = await memoryStore().removeWhere((m) => m.userId === userId);
    return { memories, conversations: 0 };
  }

  static async getEmailReport(userId: string): Promise<EmailReport> {
    const rec = await emailReportStore().get(userId);
    return rec?.settings ?? { enabled: false, time: "19:00" };
  }

  static async saveEmailReport(userId: string, settings: EmailReport): Promise<EmailReport> {
    const now = new Date().toISOString();
    await emailReportStore().upsert({
      id: userId,
      userId,
      settings,
      receivedAt: now,
    });
    return settings;
  }
}
