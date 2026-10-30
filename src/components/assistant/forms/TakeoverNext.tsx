import { useFormTexts } from "../../../hooks/useFormTexts";
import type { PartyKey } from "../../../hooks/useTakeoverForm";
import type { TakeoverData, TakeoverParty, TakeoverSalutation } from "../../../lib/forms/formTypes";
import ChoiceChips from "./ChoiceChips";
import FormCard from "./FormCard";
import FormField from "./FormField";
import PartyFields from "./PartyFields";

interface TakeoverNextProps {
  data: TakeoverData;
  onChange: (patch: Partial<TakeoverData>) => void;
  onParty: (who: PartyKey, patch: Partial<TakeoverParty>) => void;
}

const SALUTATIONS: readonly TakeoverSalutation[] = ["Frau", "Herr", "Divers", "Firma"];

/** Zukünftiger Vertragspartner: Anrede, Anschrift, Geburtsjahr und Kontakt. */
export default function TakeoverNext({ data, onChange, onParty }: TakeoverNextProps) {
  const texts = useFormTexts().takeover;
  return (
    <FormCard label={texts.next}>
      <div className="col-span-2">
        <ChoiceChips
          id="takeover-salutation"
          label={texts.salutation}
          choices={SALUTATIONS.map((value) => ({ value, label: texts.salutations[value] }))}
          value={data.salutation}
          onChange={(salutation) => onChange({ salutation })}
        />
      </div>
      <PartyFields party={data.next} onChange={(patch) => onParty("next", patch)} />
      <FormField label={texts.birthYear} value={data.birthYear} onChange={(birthYear) => onChange({ birthYear })} maxLength={10} />
      <FormField label={texts.phone} value={data.phone} onChange={(phone) => onChange({ phone })} type="tel" autoComplete="tel" />
      <FormField label={texts.email} value={data.email} onChange={(email) => onChange({ email })} type="email" autoComplete="email" wide />
    </FormCard>
  );
}
