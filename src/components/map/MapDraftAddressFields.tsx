import { Building2, Home } from "lucide-react";
import type { Vertical } from "../../lib/battle/battleCategories";
import type { DraftHouse, HouseType } from "../../lib/map/mapTypes";

interface MapDraftAddressFieldsProps {
  draft: DraftHouse;
  vertical: Vertical;
  onChangeDraft: (next: DraftHouse) => void;
}

const DRAFT_INPUT =
  "rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none dark:border-white/10 dark:bg-[#0a0f1a] dark:text-white";
const NUMBER_INPUT =
  "rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-amber-500/40 dark:bg-[#0a0f1a] dark:text-white";
const TYPE_ACTIVE = "border-slate-900 bg-slate-900/5 text-slate-900 dark:border-white dark:bg-white/10 dark:text-white";
const TYPE_IDLE = "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-[#121a2b] dark:text-white/70";

/** Adresse, Haustyp und Tür-Name des neuen Hauses (v1 TrackingMap Draft-Sheet). */
export default function MapDraftAddressFields({ draft, vertical, onChangeDraft }: MapDraftAddressFieldsProps) {
  const set = (patch: Partial<DraftHouse>) => onChangeDraft({ ...draft, ...patch });

  return (
    <>
      <div className="grid grid-cols-3 gap-2 pt-1">
        <input value={draft.street} onChange={(e) => set({ street: e.target.value })} placeholder="Straße" className={`col-span-2 ${DRAFT_INPUT}`} />
        <input value={draft.houseNumber} onChange={(e) => set({ houseNumber: e.target.value })} placeholder="Nr." className={NUMBER_INPUT} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={draft.zipCode} onChange={(e) => set({ zipCode: e.target.value })} placeholder="PLZ" className={DRAFT_INPUT} />
        <input value={draft.city} onChange={(e) => set({ city: e.target.value })} placeholder="Ort" className={DRAFT_INPUT} />
      </div>
      {vertical !== "solar" && (
        <>
          <div className="flex gap-2">
            {(["EFH", "MFH"] as HouseType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ type: t })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold transition-colors ${draft.type === t ? TYPE_ACTIVE : TYPE_IDLE}`}
              >
                {t === "EFH" ? <Home size={15} /> : <Building2 size={15} />}
                {t}
              </button>
            ))}
          </div>
          <input
            value={draft.doorName}
            onChange={(e) => set({ doorName: e.target.value })}
            placeholder="Tür/Wohnung Name (optional) – z. B. Müller"
            className={`w-full ${DRAFT_INPUT}`}
          />
        </>
      )}
    </>
  );
}
