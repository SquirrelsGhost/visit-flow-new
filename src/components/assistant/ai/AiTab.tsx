import { AnimatePresence, motion } from "motion/react";
import { useVertical } from "../../../hooks/useVertical";
import { assistantContentFor } from "../../../lib/assistant/verticalAssistant";
import { staggerParent } from "../../../lib/motion/presets";
import GlassFlow from "../../glass/GlassFlow";
import GlassFlowItem from "../../glass/GlassFlowItem";
import HotlineCard from "./HotlineCard";
import KnowledgeSection from "./KnowledgeSection";
import LinksCard from "./LinksCard";

/**
 * Reiter "KI" (v1 AITab): wichtige Links, Hotline und Wissensdatenbank.
 * In Energie und Lead (Solar) mit eigenen Links, Checkliste und Wissen; der Wechsel blendet weich über.
 */
export interface AiTabProps { readonly _?: never; }

export default function AiTab() {
  const vertical = useVertical();
  const content = assistantContentFor(vertical);
    return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={vertical}
        className="space-y-4"
        variants={staggerParent(0.08, 0.05)}
        initial="hidden"
        animate="show"
        exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.18 } }}
      >
        <GlassFlow gap="tight">
          <GlassFlowItem>
            <LinksCard content={content} />
          </GlassFlowItem>
          <GlassFlowItem>
            <HotlineCard hotline={content.hotline} />
          </GlassFlowItem>
          <GlassFlowItem col="right">
            <KnowledgeSection items={content.knowledge} />
          </GlassFlowItem>
        </GlassFlow>
      </motion.div>
    </AnimatePresence>
  );
}
