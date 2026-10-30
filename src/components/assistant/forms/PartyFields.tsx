import { useFormTexts } from "../../../hooks/useFormTexts";
import type { TakeoverParty } from "../../../lib/forms/formTypes";
import FormField from "./FormField";

interface PartyFieldsProps {
  party: TakeoverParty;
  onChange: (patch: Partial<TakeoverParty>) => void;
}

/** Name und Anschrift einer Vertragspartei; Straße und Hausnummer getrennt wie im PDF (v1 hatte ein Feld). */
export default function PartyFields({ party, onChange }: PartyFieldsProps) {
  const texts = useFormTexts().takeover;
  return (
    <>
      <FormField label={texts.name} value={party.name} onChange={(name) => onChange({ name })} wide />
      <FormField label={texts.firstName} value={party.firstName} onChange={(firstName) => onChange({ firstName })} wide />
      <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2.5">
        <FormField label={texts.street} value={party.street} onChange={(street) => onChange({ street })} />
        <FormField label={texts.houseNumber} value={party.houseNumber} onChange={(houseNumber) => onChange({ houseNumber })} maxLength={10} />
      </div>
      <div className="col-span-2 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2.5">
        <FormField label={texts.zip} value={party.zip} onChange={(zip) => onChange({ zip })} maxLength={5} />
        <FormField label={texts.city} value={party.city} onChange={(city) => onChange({ city })} />
      </div>
    </>
  );
}
