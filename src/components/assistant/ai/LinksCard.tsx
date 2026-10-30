import { Link as LinkIcon, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useSelectedLinks } from "../../../hooks/useSelectedLinks";
import type { AssistantContent } from "../../../lib/assistant/verticalAssistant";
import { cn } from "../../../lib/cn";
import { assistantTexts as t } from "../../../texts/assistantTexts";
import SectionCard from "../SectionCard";
import LinkPicker from "./LinkPicker";
import LinkTile from "./LinkTile";

const SWAP = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.22 } };

/** "Wichtige Links": vier Kacheln, über das Zahnrad lässt sich wählen, welche vier (v1 LinkCard). */
export interface LinksCardProps { content: AssistantContent }

export default function LinksCard({ content }: LinksCardProps) {
  const { ids, save } = useSelectedLinks(content);
  const [editing, setEditing] = useState(false);
  const visible = content.links.filter((link) => ids.includes(link.id));

  const gear = (
    <button
      type="button"
      onClick={() => setEditing((open) => !open)}
      aria-pressed={editing}
      title={t.linksConfigure}
      aria-label={t.linksConfigure}
      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-300"
    >
      <Settings className={cn("h-5 w-5 transition-transform duration-500 motion-reduce:transition-none", editing && "rotate-90")} />
    </button>
  );

  return (
    <SectionCard icon={LinkIcon} title={t.linksTitle} tone="blue" action={gear}>
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div key="pick" {...SWAP}>
            <LinkPicker
              links={content.links}
              initial={ids}
              onDone={(next) => {
                save(next);
                setEditing(false);
              }}
            />
          </motion.div>
        ) : (
          <motion.div key="grid" {...SWAP} className="grid grid-cols-2 gap-3 md:gap-4">
            {visible.map((link, i) => (
              <LinkTile key={link.id} link={link} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  );
}
