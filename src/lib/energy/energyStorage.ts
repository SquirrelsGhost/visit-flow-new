import { readPreference, writePreference } from "../preferences";
import { leer, START, type EnergyState } from "./energyState";

/** Schlüssel wie in v1, damit eine offene Rechnung den Umstieg übersteht. */
const KEY = "energy_pencil_sell";

export function loadEnergyState(): EnergyState {
  try {
    const raw = readPreference(KEY);
    if (!raw) return START;
    const s = JSON.parse(raw) as Partial<EnergyState> | null;
    return {
      aktiv: s?.aktiv === "gas" ? "gas" : "strom",
      strom: { ...leer("strom"), ...s?.strom },
      gas: { ...leer("gas"), ...s?.gas },
    };
  } catch {
    return START;
  }
}

/** Speicher voll oder gesperrt: der Rechner läuft trotzdem (writePreference fängt das ab). */
export function saveEnergyState(state: EnergyState): void {
  writePreference(KEY, JSON.stringify(state));
}

export function clearEnergyState(): void {
  writePreference(KEY, null);
}
