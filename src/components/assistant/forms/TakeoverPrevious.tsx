import { HeartCrack } from "lucide-react";
import { useFormTexts } from "../../../hooks/useFormTexts";
import type { PartyKey } from "../../../hooks/useTakeoverForm";
import { feedback } from "../../../lib/feedback/feedback";
import type { TakeoverData, TakeoverParty } from "../../../lib/forms/formTypes";
import FormCard from "./FormCard";
import FormField from "./FormField";
import FormToggleRow from "./FormToggleRow";
import PartyFields from "./PartyFields";

interface TakeoverPreviousProps {
  data: TakeoverData;
  onChange: (patch: Partial<TakeoverData>) => void;
  onParty: (who: PartyKey, patch: Partial<TakeoverParty>) => void;
}

/** Bisheriger Vertragspartner: Kundennummer, Todesfall und Anschrift. */
export default function TakeoverPrevious({ data, onChange, onParty }: TakeoverPreviousProps) {
  const texts = useFormTexts().takeover;
  const toggleDeceased = () => {
    feedback(data.deceased ? "toggleOff" : "toggleOn");
    onChange({ deceased: !data.deceased, previousSignature: null });
  };
  return (
    <FormCard label={texts.previous}>
      <FormField label={texts.customerNumber} value={data.customerNumber} onChange={(customerNumber) => onChange({ customerNumber })} wide />
      <div className="col-span-2 py-1">
        <FormToggleRow icon={HeartCrack} tone="rose" title={texts.deceased} subtitle={texts.deceasedHint} checked={data.deceased} onToggle={toggleDeceased} />
      </div>
      <PartyFields party={data.previous} onChange={(patch) => onParty("previous", patch)} />
    </FormCard>
  );
}
