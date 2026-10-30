// Aufklappen und Höhen-Animation brauchen den Browser
"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { cn } from "../../../lib/cn";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { ageOf, countryFlag } from "../../../lib/security/securityLogic";
import type { BlockedIp } from "../../../lib/security/securityTypes";
import GlassChip from "../../glass/GlassChip";
import { GLASS_CARD } from "../../glass/glassStyles";
import Mono from "../shared/Mono";
import { CATEGORY_STYLE } from "../securityStyles";
import BlockedIpDetails from "./BlockedIpDetails";

interface BlockedIpCardProps {
  entry: BlockedIp;
  now: number;
  expanded: boolean;
  onToggle: (ip: string) => void;
  onUnblock: (entry: BlockedIp) => void;
}

/** Eine gesperrte IP als Glaskarte: Flagge, IP, Art, Ort und seit wann; aufklappbar mit allen Details. */
export default function BlockedIpCard({ entry: b, now, expanded, onToggle, onUnblock }: BlockedIpCardProps) {
  const t = useSecurityTexts();
  const style = CATEGORY_STYLE[b.category];
  return (
    <motion.li layout="position" transition={SOFT_SPRING} className="list-none">
      <article className={cn(GLASS_CARD, "relative", b.category === "real_user" && "ring-1 ring-inset ring-sky-500/25")}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${b.ip}, ${t.firewall.category[b.category]} – ${expanded ? t.firewall.collapse : t.firewall.expand}`}
          onClick={() => onToggle(b.ip)}
          className="flex w-full items-center gap-3 py-3 pl-3.5 pr-4 text-left focus:outline-none focus-visible:bg-[var(--glass-hover)]"
        >
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--glass-track)] text-[20px] ring-1 ring-inset ring-[var(--glass-divider)]">
            {countryFlag(b.countryCode)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold text-foreground">
              <Mono>{b.ip}</Mono>
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
              <GlassChip tone={style.chip}>{t.firewall.category[b.category]}</GlassChip>
              {!b.isPermanent && <GlassChip>{t.firewall.temporary}</GlassChip>}
              <span className="truncate">{[b.email ?? b.city ?? b.country, t.ago(ageOf(b.blockedAt, now))].filter(Boolean).join(" · ")}</span>
            </span>
          </span>
          <ChevronDown aria-hidden className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 dark:text-white/35", expanded && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div key="details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
              <BlockedIpDetails entry={b} onUnblock={() => onUnblock(b)} />
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </motion.li>
  );
}
