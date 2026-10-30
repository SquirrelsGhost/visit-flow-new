// Braucht useState für Suchtext und offene Liste
"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { TeamMemberOption } from "../../../lib/map/mapTypes";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";

interface MapLassoMemberPickerProps {
  members: TeamMemberOption[];
  selected: TeamMemberOption | null;
  onSelect: (member: TeamMemberOption | null) => void;
}

/** Wem das Revier gehört: Suche über Name und Rolle (v1 Lasso-Planer). */
export default function MapLassoMemberPicker({ members, selected, onSelect }: MapLassoMemberPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const q = search.trim().toLowerCase();
  const filtered = q ? members.filter((m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)) : members;

  return (
    <div className="relative flex-1">
      <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Revier zuweisen an…"
        value={selected ? selected.name : search}
        onChange={(e) => {
          onSelect(null);
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="h-9 w-full rounded-xl border border-[var(--glass-divider)] bg-[var(--glass-press)] pl-8 pr-8 text-xs font-semibold text-slate-800 outline-none transition focus:ring-2 focus:ring-violet-500 dark:text-white"
      />
      {selected && (
        <button
          type="button"
          aria-label="Auswahl entfernen"
          onClick={() => {
            onSelect(null);
            setSearch("");
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X size={13} />
        </button>
      )}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={SNAPPY_SPRING}
              className="glass-surface glass-blur absolute left-0 right-0 top-full z-50 mt-1.5 max-h-44 overflow-y-auto rounded-2xl p-1"
            >
              {filtered.length === 0 && <div className="px-3 py-2 text-xs text-slate-500">Niemand gefunden</div>}
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelect(m);
                    setSearch(m.name);
                    setOpen(false);
                  }}
                  className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-violet-500/10"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">{m.name}</span>
                  <span className="text-[10px] capitalize text-slate-400 dark:text-slate-500">{m.role}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
