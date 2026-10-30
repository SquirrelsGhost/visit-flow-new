import { ChevronRight, FileCheck, FilePen, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useFormTexts } from "../../../hooks/useFormTexts";
import { feedback } from "../../../lib/feedback/feedback";
import { filterForms } from "../../../lib/forms/formCatalog";
import type { FormId } from "../../../lib/forms/formTypes";
import type { GlassTone } from "../../../lib/glass/glassTones";
import GlassIcon from "../../glass/GlassIcon";
import GlassRowText from "../../glass/GlassRowText";
import GlassSearchField from "../../glass/GlassSearchField";
import { GLASS_CHEVRON, GLASS_ROW_INTERACTIVE } from "../../glass/glassStyles";
import { FORM_CARD } from "./formStyles";

interface FormPickerProps {
  onPick: (id: FormId) => void;
}

const LOOK: Record<FormId, { icon: LucideIcon; tone: GlassTone }> = {
  aenderung: { icon: FilePen, tone: "orange" },
  uebernahme: { icon: FileCheck, tone: "green" },
};

/** Auswahl der Formulare mit Suche (v1 Formularliste). */
export default function FormPicker({ onPick }: FormPickerProps) {
  const texts = useFormTexts();
  const [query, setQuery] = useState("");
  const forms = filterForms(query, (id) => texts.forms[id]);
  return (
    <div className="space-y-4">
      <GlassSearchField value={query} onChange={setQuery} placeholder={texts.search} />
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {forms.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              feedback("tap");
              onPick(id);
            }}
            className={`${FORM_CARD} ${GLASS_ROW_INTERACTIVE} group flex w-full items-center gap-3.5 text-left`}
          >
            <GlassIcon {...LOOK[id]} />
            <GlassRowText title={texts.forms[id].title} subtitle={texts.forms[id].desc} />
            <ChevronRight aria-hidden className={GLASS_CHEVRON} />
          </button>
        ))}
      </div>
      {forms.length === 0 && <p className="py-10 text-center text-[13px] text-muted-foreground">{texts.noResults(query.trim())}</p>}
    </div>
  );
}
