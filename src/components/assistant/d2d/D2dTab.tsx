import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePortalOpen } from "../../../hooks/usePortalOpen";
import { useVertical } from "../../../hooks/useVertical";
import { portalSetFor } from "../../../lib/assistant/portalSets";
import type { Portal } from "../../../lib/assistant/portals";
import { staggerParent } from "../../../lib/motion/presets";
import GlassFlow from "../../glass/GlassFlow";
import GlassFlowItem from "../../glass/GlassFlowItem";
import FormsSheet from "../forms/FormsSheet";
import FeaturedPortal from "./FeaturedPortal";
import PortalSectionView from "./PortalSectionView";

/**
 * Reiter "D2D" (v1 D2DTab): oben das wichtigste Werkzeug, darunter die Abschnitte.
 * Beim Wechsel der Sparte in der Kopfzeile blenden die Kacheln weich in die neue Auswahl über.
 * "Formulare" (Telco) öffnet die Vodafone-Formulare als Sheet, wie in v1 den FormularDialog.
 */
export interface D2dTabProps { readonly _?: never; }

export default function D2dTab() {
  const openPortal = usePortalOpen();
  const vertical = useVertical();
  const set = portalSetFor(vertical);
  const [formsOpen, setFormsOpen] = useState(false);
  const open = (portal: Portal) => (portal.id === "formular" && !portal.maintenance ? setFormsOpen(true) : openPortal(portal));
  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={vertical}
          className="space-y-5"
          variants={staggerParent(0.08, 0.05)}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.18 } }}
        >
          <FeaturedPortal portal={set.featured} onOpen={open} />
          <GlassFlow gap="tight">
            {set.sections.map((section, i) => (
              <GlassFlowItem key={section.id} col={i % 2 === 0 ? "left" : "right"}>
                <PortalSectionView section={section} portals={section.portals} onOpen={open} />
              </GlassFlowItem>
            ))}
          </GlassFlow>
        </motion.div>
      </AnimatePresence>
      <FormsSheet open={formsOpen} onClose={() => setFormsOpen(false)} />
    </>
  );
}
