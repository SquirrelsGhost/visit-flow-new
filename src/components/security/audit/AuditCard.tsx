// Aufklappen und Höhen-Animation brauchen den Browser
"use client";

import { Monitor, Settings, Shield, User, ChevronDown, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatStamp, useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { cn } from "../../../lib/cn";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { formatAction } from "../../../lib/security/securityLogic";
import type { AuditCategory, AuditEntry } from "../../../lib/security/securityTypes";
import GlassIcon from "../../glass/GlassIcon";
import { GLASS_CARD } from "../../glass/glassStyles";
import { AUDIT_STYLE } from "../securityStyles";
import AuditDetails from "./AuditDetails";

interface AuditCardProps {
  entry: AuditEntry;
  expanded: boolean;
  onToggle: (id: string) => void;
  onRemove: (entry: AuditEntry) => void;
}

const ICONS: Record<AuditCategory, LucideIcon> = { SECURITY: Shield, ADMIN: Settings, USER: User, SYSTEM: Monitor };

/** Ein Protokolleintrag als Glaskarte: Bereich als Symbol, Aktion, wer und wann; aufklappbar. */
export default function AuditCard({ entry: l, expanded, onToggle, onRemove }: AuditCardProps) {
  const t = useSecurityTexts();
  return (
    <motion.li layout="position" transition={SOFT_SPRING} className="list-none">
      <article className={GLASS_CARD}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${formatAction(l.action)} – ${expanded ? t.audit.collapse : t.audit.expand}`}
          onClick={() => onToggle(l.id)}
          className="flex w-full items-center gap-3 py-3 pl-3.5 pr-4 text-left focus:outline-none focus-visible:bg-[var(--glass-hover)]"
        >
          <GlassIcon icon={ICONS[l.category]} tone={AUDIT_STYLE[l.category].tone} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">{formatAction(l.action)}</span>
            <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
              {[t.audit.categories[l.category], l.actorEmail ?? t.audit.system, formatStamp(t, l.timestamp)].join(" · ")}
            </span>
          </span>
          <ChevronDown aria-hidden className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 dark:text-white/35", expanded && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div key="details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
              <AuditDetails entry={l} onRemove={() => onRemove(l)} />
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </motion.li>
  );
}
