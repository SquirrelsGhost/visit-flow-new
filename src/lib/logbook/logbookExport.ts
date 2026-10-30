import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import { formatDate, formatDateTime } from "./logbookFormat";
import { sortTrips, tripKm } from "./logbookLogic";
import type { Trip, TripFields, Vehicle } from "./logbookTypes";

export interface ExportInput {
  trips: readonly Trip[];
  vehicles: readonly Vehicle[];
  driver: string;
  /** "Oktober 2026" oder "Jahr 2026" */
  period: string;
}

const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** Kurzfassung einer früheren Version für Export und Details: nur was sich geändert hat. */
export function describeChange(before: TripFields, after: TripFields, t: LogbookTexts): string {
  const keys = (Object.keys(before) as (keyof TripFields)[]).filter((k) => before[k] !== after[k] && k !== "vehicleId");
  return keys.map((k) => `${t.field[k]} ${k === "kind" ? t.kinds[before.kind] : String(before[k]) || "–"}`).join(", ");
}

/** Spalten je Fahrt in der Reihenfolge der Pflichtangaben (Datum, km-Stand, Ziel, Zweck, Partner). */
export function tripRow(trip: Trip, vehicles: readonly Vehicle[], t: LogbookTexts): string[] {
  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
  const last = trip.revisions[trip.revisions.length - 1];
  const changes = trip.revisions
    .map((r, i) => `${formatDateTime(r.at, t)}: ${describeChange(r.before, i + 1 < trip.revisions.length ? trip.revisions[i + 1]!.before : trip, t)}`)
    .join(" | ");
  return [
    formatDate(trip.date, t),
    trip.startTime,
    trip.endTime,
    String(trip.startKm),
    String(trip.endKm),
    String(tripKm(trip)),
    t.kindsLong[trip.kind],
    trip.from,
    trip.to,
    trip.purpose,
    trip.partner,
    trip.detour,
    vehicle ? [vehicle.name, vehicle.plate].filter(Boolean).join(" ") : "",
    trip.driver,
    formatDateTime(trip.createdAt, t),
    last ? formatDateTime(last.at, t) : "",
    changes,
  ];
}

export const exportColumns = (t: LogbookTexts) => [
  t.field.date,
  t.field.startTime,
  t.field.endTime,
  t.field.startKm,
  t.field.endKm,
  t.columnKm,
  t.field.kind,
  t.field.from,
  t.field.to,
  t.field.purpose,
  t.field.partner,
  t.field.detour,
  t.field.vehicleId,
  t.driver,
  t.columnCreated,
  t.columnChanged,
  t.columnPrevious,
];

/** CSV wie die Abrechnung: Semikolon, BOM für Excel-Umlaute; letzte Zeilen mit den Summen je Art. */
export function logbookCsv({ trips, vehicles }: ExportInput, t: LogbookTexts): string {
  const sorted = sortTrips(trips);
  const rows = sorted.map((trip) => tripRow(trip, vehicles, t).map(cell).join(";"));
  const sum = (kind?: Trip["kind"]) => sorted.filter((x) => !kind || x.kind === kind).reduce((n, x) => n + tripKm(x), 0);
  const totals = [
    [t.printSum, sum()],
    [t.kindsLong.business, sum("business")],
    [t.kindsLong.commute, sum("commute")],
    [t.kindsLong.private, sum("private")],
  ].map(([label, km]) => [cell(label!), "", "", "", "", cell(km!)].join(";"));
  return "﻿" + [exportColumns(t).map(cell).join(";"), ...rows, "", ...totals].join("\n");
}
