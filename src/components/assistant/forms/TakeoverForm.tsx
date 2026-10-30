import { useTakeoverForm } from "../../../hooks/useTakeoverForm";
import FormSubmitButton from "./FormSubmitButton";
import TakeoverBank from "./TakeoverBank";
import TakeoverDone from "./TakeoverDone";
import TakeoverNext from "./TakeoverNext";
import TakeoverPrevious from "./TakeoverPrevious";
import TakeoverSignatures from "./TakeoverSignatures";
import TakeoverTiming from "./TakeoverTiming";
import { FORM_PAIR } from "./formStyles";

interface TakeoverFormProps {
  onAnother: () => void;
}

/**
 * Vertragsübernahme (v1 FormularDialog "uebernahme"). Auf dem iPad quer Zeilen aus gleich hohen Kartenpaaren:
 * bisheriger und zukünftiger Partner, Termin und Bankverbindung, zuletzt beide Unterschriften.
 */
export default function TakeoverForm({ onAnother }: TakeoverFormProps) {
  const { data, change, changeParty, submit, busy, pdf } = useTakeoverForm();
  if (pdf) return <TakeoverDone data={data} pdf={pdf} onAnother={onAnother} />;
  return (
    <div className="space-y-4">
      <div className={FORM_PAIR}>
        <TakeoverPrevious data={data} onChange={change} onParty={changeParty} />
        <TakeoverNext data={data} onChange={change} onParty={changeParty} />
      </div>
      <div className={FORM_PAIR}>
        <TakeoverTiming data={data} onChange={change} />
        <TakeoverBank data={data} onChange={change} />
      </div>
      <TakeoverSignatures data={data} onChange={change} />
      <FormSubmitButton busy={busy} onClick={submit} />
    </div>
  );
}
