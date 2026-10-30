import { useFormTexts } from "../../../hooks/useFormTexts";
import { CHANGE_FIELDS } from "../../../lib/forms/changeForm";
import type { ChangeArea, ChangeData, ChangeSalutation } from "../../../lib/forms/formTypes";
import GlassIcon from "../../glass/GlassIcon";
import ChoiceChips from "./ChoiceChips";
import FormField from "./FormField";
import { CHANGE_AREA_LOOK } from "./changeAreaLook";
import { FORM_CARD, FORM_GRID } from "./formStyles";

interface ChangeAreaFieldsProps {
  area: ChangeArea;
  data: ChangeData;
  onChange: (patch: Partial<ChangeData>) => void;
}

const SALUTATIONS: readonly ChangeSalutation[] = ["Herr", "Frau", "Keine Angabe"];

/** Felder eines eingeschalteten Bereichs als eigene Karte mit Symbol und Namen des Bereichs. */
export default function ChangeAreaFields({ area, data, onChange }: ChangeAreaFieldsProps) {
  const texts = useFormTexts().change;
  return (
    <div className={FORM_CARD}>
      <div className="mb-3 flex items-center gap-3">
        <GlassIcon {...CHANGE_AREA_LOOK[area]} className="h-8 w-8" />
        <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{texts.areas[area]}</h4>
      </div>
      <div className={FORM_GRID}>
        {area === "name" && (
          <div className="col-span-2">
            <ChoiceChips
              id="change-salutation"
              label={texts.salutation}
              choices={SALUTATIONS.map((value) => ({ value, label: texts.salutations[value] }))}
              value={data.salutation}
              onChange={(salutation) => onChange({ salutation })}
            />
          </div>
        )}
        {CHANGE_FIELDS[area].map((field) => (
          <FormField key={field.key} label={texts.fields[field.key]} value={data[field.key]} type={field.type} wide={field.wide} onChange={(value) => onChange({ [field.key]: value })} />
        ))}
      </div>
    </div>
  );
}
