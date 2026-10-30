// Formularzustand lebt im Browser
"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/cn";
import type { Vehicle } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_INSET } from "../glass/glassStyles";
import LogbookField from "./LogbookField";
import { SOFT_BUTTON, SOFT_NEUTRAL } from "./logbookStyles";

interface VehicleSheetProps {
  open: boolean;
  vehicles: readonly Vehicle[];
  activeId: string;
  t: LogbookTexts;
  onClose: () => void;
  onSave: (vehicles: Vehicle[], activeId: string) => void;
}

/** Fahrzeuge mit Bezeichnung und Kennzeichen (Kopf jedes Exports); das aktive bekommt neue Fahrten. */
export default function VehicleSheet({ open, vehicles, activeId, t, onClose, onSave }: VehicleSheetProps) {
  const [list, setList] = useState<Vehicle[]>(() => vehicles.map((v) => ({ ...v })));
  const [active, setActive] = useState(activeId);
  const edit = (id: string, patch: Partial<Vehicle>) => setList((l) => l.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const add = () => {
    const id = `car-${Date.now().toString(36)}`;
    setList((l) => [...l, { id, name: "", plate: "" }]);
    setActive(id);
  };
  const save = () => {
    onSave(list.map((v) => ({ ...v, name: v.name.trim(), plate: v.plate.trim().toUpperCase() })), active);
    onClose();
  };
  return (
    <GlassSheet open={open} onClose={onClose} title={t.vehicleTitle} subtitle={t.vehicleHint}>
      {list.map((v, i) => (
        <div key={v.id} className={cn(GLASS_INSET, "space-y-3 p-3.5", list.length > 1 && active === v.id && "ring-red-500/35")}>
          <div className="grid grid-cols-2 gap-2.5">
            <LogbookField id={`vehicle-name-${i}`} label={t.vehicleName} value={v.name} onChange={(name) => edit(v.id, { name })} placeholder={t.vehicleNamePlaceholder} />
            <LogbookField id={`vehicle-plate-${i}`} label={t.vehiclePlate} value={v.plate} onChange={(plate) => edit(v.id, { plate })} placeholder={t.vehiclePlatePlaceholder} autoCapitalize="characters" />
          </div>
          {list.length > 1 && (
            <button type="button" role="radio" aria-checked={active === v.id} onClick={() => setActive(v.id)} className={cn(SOFT_BUTTON, active === v.id ? "bg-red-500/10 text-red-600 dark:text-red-300" : SOFT_NEUTRAL)}>
              {active === v.id && <Check aria-hidden className="h-4 w-4" />}
              {t.vehicleActive}
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className={cn(SOFT_BUTTON, SOFT_NEUTRAL, "w-full")}>
        <Plus aria-hidden className="h-4 w-4" />
        {t.vehicleAdd}
      </button>
      <button type="button" onClick={save} className={GLASS_BUTTON}>
        {t.vehicleSave}
      </button>
    </GlassSheet>
  );
}
