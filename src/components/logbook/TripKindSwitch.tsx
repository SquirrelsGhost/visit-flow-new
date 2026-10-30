import { Briefcase, Building2, Home } from "lucide-react";
import type { TripKind } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassSegmented from "../glass/GlassSegmented";

interface TripKindSwitchProps {
  value: TripKind;
  t: LogbookTexts;
  onChange: (kind: TripKind) => void;
}

/** Art der Fahrt als Glasleiste: geschäftlich, Arbeitsweg, privat. */
export default function TripKindSwitch({ value, t, onChange }: TripKindSwitchProps) {
  const segments = [
    { id: "business" as const, label: t.kinds.business, icon: Briefcase },
    { id: "commute" as const, label: t.kinds.commute, icon: Building2 },
    { id: "private" as const, label: t.kinds.private, icon: Home },
  ];
  return <GlassSegmented label={t.field.kind} segments={segments} active={value} onChange={onChange} idPrefix="trip-kind" tone="soft" />;
}
