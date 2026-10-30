// Suche, Auswahl und Speichern brauchen den Browser
"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "../../lib/cn";
import { DAILY_STATUS_META } from "../../lib/overview/dailyStatus";
import { statusOf } from "../../lib/overview/manageLogic";
import { assignStreet, type StreetPeople } from "../../lib/streets/streetApi";
import { peopleInView } from "../../lib/streets/streetPeople";
import type { StreetScope } from "../../lib/streets/streetScope";
import type { StreetRow } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassSearchField from "../glass/GlassSearchField";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_INSET } from "../glass/glassStyles";
import OrgAvatar from "../teams/OrgAvatar";

interface AssignSheetProps {
  open: boolean;
  row: StreetRow;
  scope: StreetScope;
  people: StreetPeople | null | undefined;
  onClose: () => void;
  onDone: () => void;
}

const texts = streetListTexts.assign;

/** Straße einer Person zuweisen (v1 Dialog "Straße zuweisen"); sagt vorher klar, dass die Türen mit umziehen. */
export default function AssignSheet({ open, row, scope, people, onClose, onDone }: AssignSheetProps) {
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const now = useMemo(() => new Date(), []);
  const candidates = useMemo(() => {
    const users = people ? peopleInView(scope.view, people.users, scope.meId, scope.meIsMentor, now) : [];
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => u.isActive !== false && !u.isBlocked && (!q || u.name.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name, "de-DE"));
  }, [people, scope.view, scope.meId, scope.meIsMentor, query, now]);
  const chosen = candidates.find((u) => u.id === pick) ?? people?.users.find((u) => u.id === pick);

  const submit = async () => {
    if (!chosen) return;
    setBusy(true);
    const error = await assignStreet(chosen.id, { street: row.street, zipCode: row.zipCode, city: row.city });
    setBusy(false);
    if (error !== null) return void toast.error(error || texts.failed);
    toast.success(fill(texts.done, { street: row.street, name: chosen.name }));
    setPick(null);
    onDone();
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={texts.title} subtitle={`${row.street} · ${row.zipCode} ${row.city}`}>
      <div className={cn(GLASS_INSET, "space-y-1 px-4 py-3 text-[13px] leading-snug")}>
        <p className="font-semibold text-foreground">{fill(texts.current, { names: row.memberNames.join(", ") })}</p>
        <p className="text-muted-foreground">{texts.note}</p>
      </div>
      <GlassSearchField value={query} onChange={setQuery} placeholder={texts.search} />
      <div role="radiogroup" aria-label={texts.pick} className={cn(GLASS_INSET, "max-h-[38dvh] overflow-y-auto p-1")}>
        {candidates.length === 0 && <p className="px-3 py-4 text-[13px] text-muted-foreground">{texts.none}</p>}
        {candidates.map((u) => {
          const checked = u.id === pick;
          return (
            <button key={u.id} type="button" role="radio" aria-checked={checked} onClick={() => setPick(u.id)} className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[var(--glass-hover)]", checked && "bg-red-500/[0.08]")}>
              <OrgAvatar name={u.name} role={u.role} dot={DAILY_STATUS_META[statusOf(u, now)].dot} />
              <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium text-foreground">{u.name}</span>
              {checked && <Check aria-hidden className="h-4 w-4 shrink-0 text-red-500" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => void submit()} disabled={!chosen || busy} className={GLASS_BUTTON}>
        {chosen ? fill(texts.confirm, { name: chosen.name.split(" ")[0] ?? chosen.name }) : texts.pick}
      </button>
    </GlassSheet>
  );
}
