// Braucht useState für Reiter, Multiroom-Zahl und PayTV-Auswahl
"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useSaleTariffs } from "../../../hooks/useSaleTariffs";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { saleTabs, type SaleCategory } from "../../../lib/map/saleCatalog";
import type { Tariff } from "../../../lib/tariff/tariffTypes";
import FadeSwap from "../../ui/FadeSwap";
import MapGigaExtras from "./MapGigaExtras";
import MapSaleHeader from "./MapSaleHeader";
import MapSaleTabs from "./MapSaleTabs";
import MapTariffCard from "./MapTariffCard";

interface MapSaleTariffsProps {
  category: SaleCategory;
  vertical: Vertical;
  onBack: () => void;
  /** Haupttarif plus GigaTV-Zusätze, die ohne Rückfrage mitkommen */
  onPick: (tariff: Tariff, extras: Tariff[]) => void;
}

const MULTIROOM = ["GigaTV Home Cable Multiroom Box 1", "GigaTV Home Cable Multiroom Box 2"];

/** Tarife einer Produkt-Kachel mit Reitern wie in v1 (Kabel/Glasfaser/DSL, Normal/Treue/Winback …). */
export default function MapSaleTariffs({ category, vertical, onBack, onPick }: MapSaleTariffsProps) {
  const { tariffs, loading, error, retry } = useSaleTariffs(category.id, vertical);
  const tabs = saleTabs(category.id);
  const [tab, setTab] = useState(tabs[0]?.id ?? "");
  const [multiroom, setMultiroom] = useState(0);
  const [payTv, setPayTv] = useState<string[]>([]);

  const isGiga = category.id === "GigaTV";
  const activeTab = tabs.find((t) => t.id === tab);
  const visible = tariffs.filter((t) => (activeTab ? activeTab.match(t) : true) && !(isGiga && (t.isMultiroom || t.isPayTV)));

  const pick = (tariff: Tariff) => {
    const boxes = MULTIROOM.slice(0, multiroom).flatMap((name) => tariffs.filter((t) => t.name === name));
    const extras = isGiga ? [...boxes, ...tariffs.filter((t) => t.isPayTV && payTv.includes(t.name))] : [];
    onPick(tariff, extras);
  };

  return (
    <FadeSwap>
      <MapSaleHeader title={category.label} icon={category.icon} color={category.color} onBack={onBack} />
      {tabs.length > 0 && <MapSaleTabs tabs={tabs} value={tab} onChange={setTab} layoutId={`sale-tab-${category.id}`} />}
      {isGiga && !loading && (
        <MapGigaExtras
          payTv={tariffs.filter((t) => t.isPayTV)}
          hasMultiroom={tariffs.some((t) => t.isMultiroom)}
          multiroom={multiroom}
          onMultiroom={setMultiroom}
          selectedPayTv={payTv}
          onTogglePayTv={(name) => setPayTv((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]))}
          color={category.color}
        />
      )}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-white/60">
          <Loader2 size={16} className="animate-spin" /> Lade Tarife…
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="mb-3 text-sm text-red-500">{error}</p>
          <button type="button" onClick={retry} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-white">
            Erneut versuchen
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500 dark:text-white/60">Keine aktiven Tarife verfügbar</div>
      ) : (
        <FadeSwap key={tab}>
          <div className="space-y-2">
            {visible.map((t) => (
              <MapTariffCard key={t.id} tariff={t} color={category.color} onPick={pick} />
            ))}
          </div>
        </FadeSwap>
      )}
    </FadeSwap>
  );
}
