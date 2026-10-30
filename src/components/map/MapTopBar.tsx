// Braucht useState und useEffect für Adress-Suche und Autovervollständigung
"use client";

import { Search, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchAddressSuggestions, geocodeAddressQuery } from "../../lib/map/mapGeocoding";
import type { AddressSuggestion, MapArea } from "../../lib/map/mapTypes";
import { MAP_SEARCH_EVENT } from "../../lib/copilot/tools/copilotEvents";
import MapAreaDropdown from "./MapAreaDropdown";

interface MapTopBarProps {
  areas: MapArea[];
  selectedArea: MapArea | null;
  onSelectArea: (area: MapArea | null) => void;
  onFlyToAddress: (lng: number, lat: number) => void;
  getMapCenter: () => { lng: number; lat: number } | null;
  teamCount: number;
}

/** Obere Statusleiste der Karte aus v1: Live/Gebiet-Wähler, Adresssuche mit Vorschlägen und Team-Zähler. */
export default function MapTopBar({
  areas,
  selectedArea,
  onSelectArea,
  onFlyToAddress,
  getMapCenter,
  teamCount,
}: MapTopBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const suppressRef = useRef(false);

  useEffect(() => {
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    const q = query.trim();
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      if (q.length < 3) {
        setSuggestions([]);
        return;
      }
      const list = await fetchAddressSuggestions(q, getMapCenter(), ctrl.signal);
      setSuggestions(list);
    }, 280);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, getMapCenter]);

  // Sprung von außen (Straßenliste "Auf Karte"): /dashboard?q=Adresse sucht einmal, sobald die Karte steht.
  const [incoming, setIncoming] = useState(() => (typeof window === "undefined" ? "" : (new URLSearchParams(window.location.search).get("q") ?? "")));
  // Enes zeigt eine Straße, während die Karte schon offen ist
  useEffect(() => {
    const show = (event: Event) => setIncoming(String((event as CustomEvent<string>).detail ?? ""));
    window.addEventListener(MAP_SEARCH_EVENT, show);
    return () => window.removeEventListener(MAP_SEARCH_EVENT, show);
  }, []);
  useEffect(() => {
    if (!incoming || !getMapCenter()) return;
    const timer = setTimeout(async () => {
      suppressRef.current = true;
      setQuery(incoming);
      setIncoming("");
      window.history.replaceState(null, "", window.location.pathname);
      const hit = await geocodeAddressQuery(incoming);
      if (hit) onFlyToAddress(hit.lng, hit.lat);
    }, 1200);
    return () => clearTimeout(timer);
  }, [incoming, getMapCenter, onFlyToAddress]);

  const handlePick = (s: AddressSuggestion) => {
    suppressRef.current = true;
    setQuery(s.label);
    setSuggestions([]);
    onFlyToAddress(s.lng, s.lat);
  };

  const handleSearch = async () => {
    if (suggestions[0]) {
      handlePick(suggestions[0]);
      return;
    }
    const q = query.trim();
    if (!q) return;
    setSuggestions([]);
    const hit = await geocodeAddressQuery(q);
    if (hit) onFlyToAddress(hit.lng, hit.lat);
  };

  return (
    <>
      <div className="pointer-events-none absolute left-3 right-3 top-4 z-20 flex items-center gap-2">
        <MapAreaDropdown areas={areas} selectedArea={selectedArea} onSelectArea={onSelectArea} />

        <div className="glass-surface glass-blur pointer-events-auto flex h-[42px] min-w-0 flex-1 items-center gap-1.5 rounded-full px-3">
          <Search size={16} className="flex-shrink-0 text-slate-400 dark:text-white/70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSearch();
            }}
            placeholder="Adresse suchen…"
            aria-label="Adresse suchen"
            className="w-full border-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-white/50"
          />
          {query && (
            <button
              type="button"
              aria-label="Suche leeren"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="flex-shrink-0 rounded-full p-0.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-95 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="glass-surface glass-blur pointer-events-auto flex h-[42px] w-[74px] flex-shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-slate-800 dark:text-white">
          <Users size={15} /> {teamCount}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="glass-surface glass-blur absolute left-3 right-3 top-16 z-30 overflow-hidden rounded-[24px]">
          {suggestions.map((s, i) => (
            <button
              key={`${s.label}-${i}`}
              type="button"
              onClick={() => handlePick(s)}
              className="flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 active:bg-slate-100 dark:border-white/5 dark:active:bg-white/5"
            >
              <Search size={13} className="flex-shrink-0 text-slate-400" />
              <span className="truncate text-sm text-slate-900 dark:text-white">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
