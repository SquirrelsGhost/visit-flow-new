import { AnimatePresence, motion } from "motion/react";
import { useFormTexts } from "../../../hooks/useFormTexts";
import type { TakeoverData, TakeoverTiming as Timing } from "../../../lib/forms/formTypes";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { GLASS_FOOTER } from "../../glass/glassStyles";
import ChoiceChips from "./ChoiceChips";
import FormCard from "./FormCard";
import FormField from "./FormField";

interface TakeoverTimingProps {
  data: TakeoverData;
  onChange: (patch: Partial<TakeoverData>) => void;
}

/** Termin der Übernahme: schnellstmöglich oder Wunschtermin mit Datum. */
export default function TakeoverTiming({ data, onChange }: TakeoverTimingProps) {
  const texts = useFormTexts().takeover;
  const choices: { value: Timing; label: string }[] = [
    { value: "asap", label: texts.asap },
    { value: "date", label: texts.onDate },
  ];
  return (
    <FormCard label={texts.timing}>
      <div className="col-span-2">
        <ChoiceChips id="takeover-timing" label={texts.timing} hideLabel choices={choices} value={data.timing} onChange={(timing) => onChange({ timing })} />
      </div>
      <AnimatePresence initial={false}>
        {data.timing === "date" && (
          <motion.div key="date" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="col-span-2 overflow-hidden">
            <FormField label={texts.date} value={data.date} onChange={(date) => onChange({ date })} type="date" />
          </motion.div>
        )}
      </AnimatePresence>
      <p className={`${GLASS_FOOTER} col-span-2 pt-0`}>{texts.asapHint}</p>
    </FormCard>
  );
}
