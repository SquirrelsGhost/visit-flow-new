import { motion } from "motion/react";
import { copilotTexts } from "../../texts/copilotTexts";
import { GLASS_LABEL } from "../glass/glassStyles";

interface CopilotSuggestionsProps {
  prompts: readonly string[];
  onPick: (prompt: string) => void;
}

const CHIP =
  "no-touch-target-fix glass-surface rounded-2xl px-3.5 py-2 text-left text-[13px] font-medium leading-snug text-foreground transition-[background-color,transform] duration-200 hover:bg-[var(--glass-hover)] active:scale-[0.98]";

/** Startfragen passend zu Seite, Rolle und Sparte; ein Tipp schickt sie direkt ab. */
export default function CopilotSuggestions({ prompts, onPick }: CopilotSuggestionsProps) {
  return (
    <div className="pt-2">
      <p className={GLASS_LABEL}>{copilotTexts.suggestionsTitle}</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, i) => (
          <motion.button
            key={prompt}
            type="button"
            className={CHIP}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.06, type: "spring", stiffness: 340, damping: 28 }}
            onClick={() => onPick(prompt)}
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
