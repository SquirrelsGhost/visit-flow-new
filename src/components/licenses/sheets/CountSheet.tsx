import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { formatDay, lowestCount } from "../../../lib/licenses/licenseLogic";
import type { TeamLicenses } from "../../../lib/licenses/licenseTypes";
import { LICENSE_PRESETS, LICENSES } from "../../../lib/onboarding/licenses";
import { licenseTexts } from "../../../texts/licenseTexts";
import { fill } from "../../../texts/profileTexts";
import GlassFilterChips from "../../glass/GlassFilterChips";
import GlassSheet from "../../glass/GlassSheet";
import CostCompare from "./CostCompare";
import CountStepper from "./CountStepper";
import SheetButton from "./SheetButton";
import SheetNote from "./SheetNote";

interface CountSheetProps {
  open: boolean;
  data: TeamLicenses;
  /** Startwert (z. B. eine mehr bei "Hinzufügen"). */
  start: number;
  busy: boolean;
  onClose: () => void;
  onSave: (count: number) => Promise<boolean>;
}

const texts = licenseTexts.sheets.count;

/** Anzahl der gebuchten Lizenzen ändern; zeigt vor dem Bestätigen, was sich am Monatsbetrag ändert. */
export default function CountSheet({ open, data, start, busy, onClose, onSave }: CountSheetProps) {
  const min = lowestCount(data);
  const clamp = (value: number) => Math.min(LICENSES.max, Math.max(min, value));
  const [count, setCount] = useState(() => clamp(start));
  const presets = LICENSE_PRESETS.filter((p) => p >= min).map((p) => ({ id: String(p), label: String(p) }));
  const unchanged = count === data.licenseCount;

  const save = async () => {
    if (await onSave(count)) onClose();
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={texts.title} subtitle={fill(texts.text, { min: data.minLicenses })}>
      <CountStepper value={count} min={min} max={LICENSES.max} onChange={(v) => setCount(clamp(v))} />
      {presets.length > 1 && <GlassFilterChips options={presets} active={String(count)} onChange={(id) => setCount(clamp(Number(id)))} label={texts.title} layoutId="license-count-preset" />}
      <CostCompare from={data.licenseCount} to={count} />
      <SheetNote icon={CalendarClock}>{fill(texts.noCharge, { date: formatDay(data.renewsAt) })}</SheetNote>
      <SheetButton label={unchanged ? texts.unchanged : texts.confirm} busyLabel={texts.saving} busy={busy} disabled={unchanged} onClick={save} />
    </GlassSheet>
  );
}
