// Formular und Speichern brauchen den Browser
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "../../lib/cn";
import { updateDoors } from "../../lib/streets/streetApi";
import type { AddressPatch, StreetDoor, StreetRow } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_FIELD, GLASS_INSET } from "../glass/glassStyles";

interface EditDoorsSheetProps {
  open: boolean;
  row: StreetRow;
  doors: readonly StreetDoor[];
  onClose: () => void;
  onDone: () => void;
}

const texts = streetListTexts.edit;
/** Straße breit mit schmaler Hausnummer, darunter schmale PLZ mit breitem Ort. */
const ROWS: readonly [fields: (keyof AddressPatch)[], cols: string][] = [
  [["street", "houseNumber"], "grid-cols-[1fr_6.5rem]"],
  [["zipCode", "city"], "grid-cols-[6.5rem_1fr]"],
];

/** Adresse der gewählten Türen korrigieren (v1 Dialog "Adressen bearbeiten", PUT /doors/:id je Tür). */
export default function EditDoorsSheet({ open, row, doors, onClose, onDone }: EditDoorsSheetProps) {
  const first = doors[0];
  const initial: AddressPatch = { street: row.street, houseNumber: first?.houseNumber ?? "", zipCode: row.zipCode, city: row.city };
  const [form, setForm] = useState<AddressPatch>(initial);
  const [wasOpen, setWasOpen] = useState(open);
  const [busy, setBusy] = useState(false);
  // Beim Öffnen mit der Adresse der ersten gewählten Tür neu beginnen.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(initial);
  }

  const save = async () => {
    setBusy(true);
    const result = await updateDoors(doors.map((d) => d.id), form);
    setBusy(false);
    if (result.failed === 0) toast.success(fill(texts.done, { count: result.ok.length }));
    else toast.warning(fill(texts.partial, { success: result.ok.length, total: doors.length, failed: result.failed }));
    onDone();
  };

  const valid = form.street.trim() && form.houseNumber.trim() && form.zipCode.trim() && form.city.trim();
  return (
    <GlassSheet open={open} onClose={onClose} title={doors.length > 1 ? fill(texts.titleMany, { count: doors.length }) : texts.title} subtitle={`${row.street} · ${row.zipCode} ${row.city}`}>
      <div className={cn(GLASS_INSET, "max-h-28 overflow-y-auto px-4 py-3 text-[12.5px] text-muted-foreground")}>
        <p className="pb-1 font-semibold text-foreground">{texts.affected}</p>
        {doors.map((d) => (
          <p key={d.id} className="truncate">
            {row.street} {d.houseNumber}
            {d.customerName ? ` · ${d.customerName}` : ""}
          </p>
        ))}
      </div>
      {ROWS.map(([fields, cols]) => (
        <div key={fields.join()} className={cn("grid gap-2", cols)}>
          {fields.map((field) => (
            <label key={field} className="block min-w-0">
              <span className="block px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{texts[field]}</span>
              <input value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} inputMode={field === "zipCode" ? "numeric" : undefined} className={GLASS_FIELD} />
            </label>
          ))}
        </div>
      ))}
      <button type="button" onClick={() => void save()} disabled={!valid || busy} className={GLASS_BUTTON}>
        {busy ? texts.saving : texts.save}
      </button>
    </GlassSheet>
  );
}
