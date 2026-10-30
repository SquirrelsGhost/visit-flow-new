import { useState } from "react";
import { cn } from "../../lib/cn";
import type { SimCategory } from "../../lib/simulator/simulatorCatalog";
import type { SimTariff } from "../../lib/simulator/simulatorTypes";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import SettingsGroup from "../settings/SettingsGroup";
import { ROW_DIVIDER } from "../settings/settingsStyles";
import FadeSwap from "../ui/FadeSwap";
import ChoiceChip from "./ChoiceChip";
import TariffRow from "./TariffRow";
import { HORIZONTAL_SCROLL } from "./simulatorStyles";

interface TariffGroupProps {
  categories: readonly SimCategory[];
  tariffsFor: (key: string) => SimTariff[];
  loading: boolean;
  footer: string;
  onAdd: (tariff: SimTariff, category: SimCategory) => void;
}

const SKELETON = "h-[3.75rem] animate-pulse bg-[var(--glass-hover)] motion-reduce:animate-none";

/** Kategorie wählen, Tarif antippen. Die Kategorien laufen auf schmalen Bildschirmen seitlich weiter. */
export default function TariffGroup({ categories, tariffsFor, loading, footer, onAdd }: TariffGroupProps) {
  const [activeKey, setActiveKey] = useState(categories[0]?.key ?? "");
  const active = categories.find((c) => c.key === activeKey) ?? categories[0];
  if (!active) return null;
  const list = tariffsFor(active.key);
  return (
    <SettingsGroup label={t.tariffs.label} footer={footer}>
      <div className="px-4 pt-3.5 pb-3">
        <div role="tablist" aria-label={t.tariffs.label} className={HORIZONTAL_SCROLL}>
          {categories.map((c) => (
            <ChoiceChip key={c.key} role="tab" selected={c.key === active.key} tone={c.tone} pillId="sim-category" onSelect={() => setActiveKey(c.key)} className="shrink-0">
              <span>
                {c.label}
                {tariffsFor(c.key).length > 0 && <span className="ml-1 text-[10px] opacity-70">{tariffsFor(c.key).length}</span>}
              </span>
            </ChoiceChip>
          ))}
        </div>
      </div>
      <FadeSwap key={active.key}>
        <div role="tabpanel" aria-label={active.label} className={cn(ROW_DIVIDER, "[&>*+*]:before:left-4")}>
          {loading ? (
            [0, 1, 2].map((i) => <div key={i} className={SKELETON} />)
          ) : list.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">{t.tariffs.empty}</p>
          ) : (
            list.map((tariff) => <TariffRow key={tariff.id} tariff={tariff} onAdd={() => onAdd(tariff, active)} />)
          )}
        </div>
      </FadeSwap>
    </SettingsGroup>
  );
}

