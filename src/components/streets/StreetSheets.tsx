// Auswahl und offene Sheets leben im Browser
"use client";

import { useState } from "react";
import { useLastDefined } from "../../hooks/useLastDefined";
import type { StreetPeople } from "../../lib/streets/streetApi";
import type { StreetScope } from "../../lib/streets/streetScope";
import type { StreetRow } from "../../lib/streets/streetTypes";
import AssignSheet from "./AssignSheet";
import DeleteDoorsSheet from "./DeleteDoorsSheet";
import EditDoorsSheet from "./EditDoorsSheet";
import StreetSheet from "./StreetSheet";

interface StreetSheetsProps {
  scope: StreetScope;
  people: StreetPeople | null | undefined;
  rows: readonly StreetRow[];
  openKey: string | null;
  onClose: () => void;
  onChanged: () => void;
}

type Sub = "assign" | "edit" | "delete";

/**
 * Sheets einer Straße: Häuser und Türen, von dort Zuweisen, Adressen korrigieren und Löschen.
 * Ein Unter-Sheet ersetzt das Straßen-Sheet und kehrt danach dorthin zurück.
 */
export default function StreetSheets({ scope, people, rows, openKey, onClose, onChanged }: StreetSheetsProps) {
  const [sub, setSub] = useState<Sub | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const live = rows.find((r) => r.key === openKey) ?? null;
  const row = useLastDefined(live);
  const picked = row ? row.doors.filter((d) => selected.has(d.id)) : [];

  const close = () => {
    setSelecting(false);
    setSelected(new Set());
    setSub(null);
    onClose();
  };
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const finished = (stay: boolean) => {
    setSub(null);
    setSelected(new Set());
    setSelecting(false);
    onChanged();
    if (!stay) close();
  };

  return (
    <>
      <StreetSheet
        row={row ?? undefined}
        open={live !== null && sub === null}
        scope={scope}
        selecting={selecting}
        selected={selected}
        onSelecting={(on) => {
          setSelecting(on);
          if (!on) setSelected(new Set());
        }}
        onToggle={toggle}
        onAction={setSub}
        onClose={close}
      />
      {row && (
        <>
          <AssignSheet open={sub === "assign"} row={row} scope={scope} people={people} onClose={() => setSub(null)} onDone={() => finished(false)} />
          <EditDoorsSheet open={sub === "edit"} row={row} doors={picked} onClose={() => setSub(null)} onDone={() => finished(true)} />
          <DeleteDoorsSheet open={sub === "delete"} row={row} doors={picked} onClose={() => setSub(null)} onDone={() => finished(picked.length < row.doors.length)} />
        </>
      )}
    </>
  );
}
