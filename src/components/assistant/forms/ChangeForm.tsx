import { AnimatePresence, motion } from "motion/react";
import { useChangeForm } from "../../../hooks/useChangeForm";
import { useFormTexts } from "../../../hooks/useFormTexts";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import GlassFlow from "../../glass/GlassFlow";
import GlassFlowItem from "../../glass/GlassFlowItem";
import { GLASS_FOOTER, GLASS_LABEL } from "../../glass/glassStyles";
import ChangeAreaFields from "./ChangeAreaFields";
import ChangeAreaList from "./ChangeAreaList";
import FormField from "./FormField";
import FormSubmitButton from "./FormSubmitButton";
import { FORM_CARD, FORM_GRID } from "./formStyles";

interface ChangeFormProps {
  onDone: () => void;
}

const CARD_MOTION = { initial: { opacity: 0, y: 10, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, scale: 0.98 }, transition: SOFT_SPRING } as const;

/**
 * Änderungsmitteilung (v1 FormularDialog "aenderung"). Links eigene Daten und die Bereiche als Schalter,
 * rechts die Felder der eingeschalteten Bereiche; auf dem Handy in derselben Reihenfolge untereinander.
 */
export default function ChangeForm({ onDone }: ChangeFormProps) {
  const texts = useFormTexts().change;
  const { data, change, toggle, submit, busy } = useChangeForm(onDone);
  return (
    <div className="space-y-4">
      <GlassFlow ratio="aside" gap="tight">
        <GlassFlowItem col="left">
          <section>
            <h3 className={GLASS_LABEL}>{texts.you}</h3>
            <div className={`${FORM_CARD} ${FORM_GRID}`}>
              <FormField label={texts.vpkn} value={data.vpkn} onChange={(vpkn) => change({ vpkn })} wide />
              <FormField label={texts.firstName} value={data.firstName} onChange={(firstName) => change({ firstName })} autoComplete="given-name" />
              <FormField label={texts.lastName} value={data.lastName} onChange={(lastName) => change({ lastName })} autoComplete="family-name" />
            </div>
            <p className={GLASS_FOOTER}>{texts.youFooter}</p>
          </section>
        </GlassFlowItem>
        <GlassFlowItem col="left">
          <ChangeAreaList areas={data.areas} onToggle={toggle} />
        </GlassFlowItem>
        <GlassFlowItem col="right">
          <section>
            <h3 className={GLASS_LABEL}>{texts.fieldsTitle}</h3>
            <div className="space-y-4">
              <AnimatePresence initial={false} mode="popLayout">
                {data.areas.length === 0 && (
                  <motion.p key="empty" {...CARD_MOTION} className={`${FORM_CARD} text-[13px] leading-snug text-muted-foreground`}>
                    {texts.emptyHint}
                  </motion.p>
                )}
                {data.areas.map((area) => (
                  <motion.div key={area} layout {...CARD_MOTION}>
                    <ChangeAreaFields area={area} data={data} onChange={change} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </GlassFlowItem>
      </GlassFlow>
      <FormSubmitButton busy={busy} onClick={submit} />
    </div>
  );
}
