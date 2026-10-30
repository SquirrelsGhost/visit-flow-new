import { useFormTexts } from "../../../hooks/useFormTexts";
import type { TakeoverData } from "../../../lib/forms/formTypes";
import FormCard from "./FormCard";
import FormField from "./FormField";

interface TakeoverBankProps {
  data: TakeoverData;
  onChange: (patch: Partial<TakeoverData>) => void;
}

/** SEPA-Mandat des neuen Kunden. */
export default function TakeoverBank({ data, onChange }: TakeoverBankProps) {
  const texts = useFormTexts().takeover;
  return (
    <FormCard label={texts.bank}>
      <FormField label={texts.bankHolder} value={data.bankHolder} onChange={(bankHolder) => onChange({ bankHolder })} wide />
      <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_8.5rem] gap-2.5">
        <FormField label={texts.iban} value={data.iban} onChange={(iban) => onChange({ iban })} maxLength={42} />
        <FormField label={texts.bic} value={data.bic} onChange={(bic) => onChange({ bic })} maxLength={11} />
      </div>
    </FormCard>
  );
}
