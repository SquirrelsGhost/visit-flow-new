import type {
  LogbookMonthInput,
  LogbookMonthView,
  LogbookProfileInput,
  LogbookProfileView,
  LogbookView,
} from "@/shared/logbook/logbookSchema";
import type { StoredRecord } from "./store/RecordStore";
import { createStore } from "./store/storeFactory";

interface StoredLogbookUserRecord extends StoredRecord {
  id: string;
  userId: string;
  profile: LogbookProfileView;
  months: Record<string, LogbookMonthView>;
  receivedAt: string;
  updatedAt: string;
}

const logbookStore = () => createStore<StoredLogbookUserRecord>("logbook");

function emptyRecord(userId: string): StoredLogbookUserRecord {
  const now = new Date().toISOString();
  return {
    id: userId,
    userId,
    profile: {
      rev: 0,
      vehicles: [{ id: "v-default", name: "Dienstwagen", plate: "" }],
      activeVehicleId: "v-default",
      importedV1: false,
      updatedAt: now,
    },
    months: {},
    receivedAt: now,
    updatedAt: now,
  };
}

export class LogbookDatabaseService {
  static async getView(userId: string, since?: string | null): Promise<LogbookView> {
    const record = (await logbookStore().get(userId)) ?? emptyRecord(userId);
    const months = Object.values(record.months).filter((m) => !since || m.updatedAt >= since);
    return {
      profile: record.profile,
      months,
      syncedAt: new Date().toISOString(),
    };
  }

  static async putMonth(
    userId: string,
    month: string,
    input: LogbookMonthInput,
  ): Promise<{ ok: true; data: LogbookMonthView } | { ok: false; status: number; error: string; current?: LogbookMonthView }> {
    const record = (await logbookStore().get(userId)) ?? emptyRecord(userId);
    const existing = record.months[month];
    if (existing && existing.rev > input.baseRev) {
      return {
        ok: false,
        status: 409,
        error: "Monat wurde auf einem anderen Gerät aktualisiert.",
        current: existing,
      };
    }
    const now = new Date().toISOString();
    const savedMonth: LogbookMonthView = {
      month,
      rev: (existing?.rev ?? 0) + 1,
      trips: input.trips,
      lock: input.lock,
      updatedAt: now,
    };
    const nextRecord: StoredLogbookUserRecord = {
      ...record,
      months: { ...record.months, [month]: savedMonth },
      updatedAt: now,
    };
    await logbookStore().upsert(nextRecord);
    return { ok: true, data: savedMonth };
  }

  static async putProfile(
    userId: string,
    input: LogbookProfileInput,
  ): Promise<{ ok: true; data: LogbookProfileView } | { ok: false; status: number; error: string; current?: LogbookProfileView }> {
    const record = (await logbookStore().get(userId)) ?? emptyRecord(userId);
    if (record.profile.rev > input.baseRev) {
      return {
        ok: false,
        status: 409,
        error: "Fahrzeugprofil wurde inzwischen aktualisiert.",
        current: record.profile,
      };
    }
    const now = new Date().toISOString();
    const savedProfile: LogbookProfileView = {
      rev: record.profile.rev + 1,
      vehicles: input.vehicles,
      activeVehicleId: input.activeVehicleId,
      importedV1: input.importedV1,
      updatedAt: now,
    };
    await logbookStore().upsert({
      ...record,
      profile: savedProfile,
      updatedAt: now,
    });
    return { ok: true, data: savedProfile };
  }
}
