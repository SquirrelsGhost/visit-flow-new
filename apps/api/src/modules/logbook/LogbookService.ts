import type {
  LogbookMonthInput,
  LogbookMonthView,
  LogbookProfileInput,
  LogbookProfileView,
  LogbookView,
} from "@visit-flow/shared/logbookSchema";
import { seal, unseal } from "../../lib/crypto/dataCipher";
import { badRequest, conflict } from "../../lib/http/HttpError";
import type { LogbookMonthDoc, LogbookProfileDoc } from "./Logbook.model";
import type { LogbookRepository } from "./LogbookRepository";
import { checkMonthChange, type MonthContent } from "./logbookRules";

type ProfileContent = Omit<LogbookProfileView, "rev" | "updatedAt">;

const DEFAULT_VEHICLE_ID = "car-1";
const emptyProfile = (): LogbookProfileView => ({
  rev: 0,
  vehicles: [{ id: DEFAULT_VEHICLE_ID, name: "", plate: "" }],
  activeVehicleId: DEFAULT_VEHICLE_ID,
  importedV1: false,
  updatedAt: null,
});

const CONFLICT_MESSAGE = "Das Fahrtenbuch wurde inzwischen auf einem anderen Gerät geändert";

/**
 * Fahrtenbuch je Nutzer: ein verschlüsselter Datensatz pro Monat plus Fahrzeuge.
 * Jeder Nutzer sieht nur sein eigenes Buch (userId kommt aus dem Token, nie aus der Anfrage).
 * Schreibt ein zweites Gerät dazwischen, antwortet der Server mit 409 und dem aktuellen Stand.
 */
export class LogbookService {
  constructor(
    private readonly repository: LogbookRepository,
    private readonly secret: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  private open<T>(doc: { payload: LogbookMonthDoc["payload"] }): T {
    return JSON.parse(unseal(doc.payload, this.secret)) as T;
  }

  private monthView(doc: LogbookMonthDoc): LogbookMonthView {
    const content = this.open<MonthContent>(doc);
    return { month: doc.month, rev: doc.rev, trips: content.trips, lock: content.lock, updatedAt: doc.updatedAt.toISOString() };
  }

  private profileView(doc: LogbookProfileDoc | null): LogbookProfileView {
    if (!doc) return emptyProfile();
    return { ...this.open<ProfileContent>(doc), rev: doc.rev, updatedAt: doc.updatedAt.toISOString() };
  }

  async get(userId: string, since?: Date): Promise<LogbookView> {
    const syncedAt = this.now().toISOString();
    const [profile, months] = await Promise.all([this.repository.findProfile(userId), this.repository.listMonths(userId, since)]);
    return { profile: this.profileView(profile), months: months.map((doc) => this.monthView(doc)), syncedAt };
  }

  async saveMonth(userId: string, month: string, input: LogbookMonthInput): Promise<LogbookMonthView> {
    const stored = await this.repository.findMonth(userId, month);
    if ((stored?.rev ?? 0) !== input.baseRev) throw this.monthConflict(stored);
    const next: MonthContent = { trips: input.trips, lock: input.lock };
    checkMonthChange(month, stored ? this.open<MonthContent>(stored) : null, next);
    const saved = await this.repository.saveMonth({
      baseRev: input.baseRev,
      doc: { userId, month, payload: seal(JSON.stringify(next), this.secret), rev: input.baseRev + 1, updatedAt: this.now() },
    });
    if (!saved) throw this.monthConflict(await this.repository.findMonth(userId, month));
    return this.monthView(saved);
  }

  async saveProfile(userId: string, input: LogbookProfileInput): Promise<LogbookProfileView> {
    const ids = new Set(input.vehicles.map((vehicle) => vehicle.id));
    if (ids.size !== input.vehicles.length) throw badRequest("Fahrzeug ist doppelt", { vehicles: "doppelt" });
    if (!ids.has(input.activeVehicleId)) throw badRequest("Aktives Fahrzeug fehlt", { activeVehicleId: "unbekannt" });
    const content: ProfileContent = { vehicles: input.vehicles, activeVehicleId: input.activeVehicleId, importedV1: input.importedV1 };
    const saved = await this.repository.saveProfile({
      baseRev: input.baseRev,
      doc: { userId, payload: seal(JSON.stringify(content), this.secret), rev: input.baseRev + 1, updatedAt: this.now() },
    });
    if (!saved) throw conflict(CONFLICT_MESSAGE, { current: this.profileView(await this.repository.findProfile(userId)) });
    return this.profileView(saved);
  }

  /** Auskunft (Art. 15/20 DSGVO): das ganze Buch im Klartext. */
  async exportUser(userId: string): Promise<LogbookView> {
    return this.get(userId);
  }

  deleteUser(userId: string): Promise<number> {
    return this.repository.deleteForUser(userId);
  }

  private monthConflict(stored: LogbookMonthDoc | null) {
    return conflict(CONFLICT_MESSAGE, { current: stored ? this.monthView(stored) : null });
  }
}
