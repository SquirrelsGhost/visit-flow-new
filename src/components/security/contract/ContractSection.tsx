import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import type { PolicySection } from "@/texts/securityPolicyTexts";

interface ContractSectionProps {
  section: PolicySection;
  open: boolean;
  onToggle: () => void;
}

/** Ein Paragraf des Vertrags als aufklappbare Zeile: Überschrift immer sichtbar, Text weich ein- und ausgeblendet. */
export default function ContractSection({ section, open, onToggle }: ContractSectionProps) {
  const match = /^(§\s*\d+)\s+(.*)$/.exec(section.heading);
  const number = match?.[1] ?? "§";
  const title = match?.[2] ?? section.heading;
  const panelId = `${section.id}-panel`;
  return (
    <div>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="no-touch-target-fix group flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-[var(--glass-hover)] focus:outline-none focus-visible:bg-[var(--glass-hover)]">
        <span className="mt-px flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 px-1.5 text-[12px] font-bold text-red-600 dark:text-red-400">{number}</span>
        <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-foreground">{title}</span>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-[var(--glass-label)] transition-transform duration-300 motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={panelId} key="panel" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="space-y-2 pb-4 pl-14 pr-5 text-[13px] leading-relaxed text-foreground/80">
              {section.paragraphs.map((p, i) => (
                <p key={`${section.id}-p${i}`}>{p}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-1 pl-4 marker:text-red-500/70">
                  {section.bullets.map((b, i) => (
                    <li key={`${section.id}-b${i}`}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
