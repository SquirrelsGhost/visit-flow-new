import { HeartCrack } from "lucide-react";
import { useFormTexts } from "../../../hooks/useFormTexts";
import type { TakeoverData } from "../../../lib/forms/formTypes";
import GlassIcon from "../../glass/GlassIcon";
import { GLASS_FOOTER } from "../../glass/glassStyles";
import FormCard from "./FormCard";
import SignaturePad from "./SignaturePad";
import { FORM_PAIR } from "./formStyles";

interface TakeoverSignaturesProps {
  data: TakeoverData;
  onChange: (patch: Partial<TakeoverData>) => void;
}

/**
 * Beide Unterschriften nebeneinander (iPad quer), damit das Gerät nur weitergereicht werden muss.
 * Im Todesfall steht statt der ersten Unterschrift der Hinweis auf die Sterbeurkunde.
 */
export default function TakeoverSignatures({ data, onChange }: TakeoverSignaturesProps) {
  const texts = useFormTexts().takeover;
  return (
    <div>
      <div className={FORM_PAIR}>
        <FormCard label={texts.signPrevious}>
          <div className="col-span-2">
            {data.deceased ? (
              <div className="flex h-[150px] flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--glass-track)] px-6 text-center">
                <GlassIcon icon={HeartCrack} tone="rose" />
                <p className="text-[13px] leading-snug text-muted-foreground">{texts.deceasedHint}</p>
              </div>
            ) : (
              <SignaturePad key="previous" title={texts.signPrevious} onChange={(previousSignature) => onChange({ previousSignature })} />
            )}
          </div>
        </FormCard>
        <FormCard label={texts.signNext}>
          <div className="col-span-2">
            <SignaturePad title={texts.signNext} onChange={(nextSignature) => onChange({ nextSignature })} />
          </div>
        </FormCard>
      </div>
      <p className={GLASS_FOOTER}>{texts.signHint}</p>
    </div>
  );
}
