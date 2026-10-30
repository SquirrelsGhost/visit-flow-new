import { useFormTexts } from "../../../hooks/useFormTexts";
import { CHANGE_AREAS } from "../../../lib/forms/changeForm";
import type { ChangeArea } from "../../../lib/forms/formTypes";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_LABEL } from "../../glass/glassStyles";
import FormToggleRow from "./FormToggleRow";
import { CHANGE_AREA_LOOK } from "./changeAreaLook";

interface ChangeAreaListProps {
  areas: readonly ChangeArea[];
  onToggle: (area: ChangeArea) => void;
}

/** Die sechs Bereiche der Änderungsmitteilung als Schalter in einer Glaskarte (v1 Checkboxen). */
export default function ChangeAreaList({ areas, onToggle }: ChangeAreaListProps) {
  const texts = useFormTexts().change;
  return (
    <section>
      <h3 className={GLASS_LABEL}>{texts.whatTitle}</h3>
      <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
        {CHANGE_AREAS.map((area) => (
          <div key={area} className="px-4 py-3">
            <FormToggleRow {...CHANGE_AREA_LOOK[area]} title={texts.areas[area]} checked={areas.includes(area)} onToggle={() => onToggle(area)} />
          </div>
        ))}
      </div>
    </section>
  );
}
