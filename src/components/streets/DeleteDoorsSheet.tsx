// Löschen braucht den Browser
"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "../../lib/cn";
import { deleteDoors } from "../../lib/streets/streetApi";
import type { StreetDoor, StreetRow } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_INSET } from "../glass/glassStyles";

interface DeleteDoorsSheetProps {
  open: boolean;
  row: StreetRow;
  doors: readonly StreetDoor[];
  onClose: () => void;
  onDone: () => void;
}

const texts = streetListTexts.remove;

/** Sicherheitsfrage vor dem endgültigen Löschen (v1 Dialog "Häuser löschen"). */
export default function DeleteDoorsSheet({ open, row, doors, onClose, onDone }: DeleteDoorsSheetProps) {
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const result = await deleteDoors(doors.map((d) => d.id));
    setBusy(false);
    if (result.failed === 0) toast.success(fill(texts.done, { count: result.ok.length }));
    else toast.warning(fill(texts.partial, { success: result.ok.length, total: doors.length, failed: result.failed }));
    onDone();
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={texts.title} subtitle={fill(texts.text, { count: doors.length })}>
      <div className={cn(GLASS_INSET, "max-h-40 overflow-y-auto px-4 py-3 text-[13px]")}>
        {doors.map((d) => (
          <p key={d.id} className="truncate py-0.5">
            <span className="font-semibold text-foreground">
              {row.street} {d.houseNumber}
            </span>
            <span className="text-muted-foreground">
              {" "}
              · {row.zipCode} {row.city}
              {d.customerName ? ` · ${d.customerName}` : ""}
            </span>
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="glass-surface h-12 flex-1 rounded-2xl text-sm font-semibold text-foreground">
          {streetListTexts.cancel}
        </button>
        <button type="button" onClick={() => void remove()} disabled={busy} className={cn(GLASS_BUTTON, "flex-1")}>
          <Trash2 aria-hidden className="h-4 w-4" /> {busy ? texts.deleting : texts.confirm}
        </button>
      </div>
    </GlassSheet>
  );
}
