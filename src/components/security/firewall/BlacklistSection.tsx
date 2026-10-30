// Suche, Filter und Aufklappen leben im Browser
"use client";

import { useMemo, useState } from "react";
import { useNow } from "../../../hooks/useNow";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { filterBlacklist, groupCounts } from "../../../lib/security/securityLogic";
import { BLOCK_GROUPS, type BlockedIp, type BlockGroup } from "../../../lib/security/securityTypes";
import GlassFilterChips from "../../glass/GlassFilterChips";
import GlassSearchField from "../../glass/GlassSearchField";
import GlassSection from "../../glass/GlassSection";
import { GLASS_LABEL } from "../../glass/glassStyles";
import PartError from "../shared/PartError";
import { EMPTY_ROW } from "../securityStyles";
import BlockedIpCard from "./BlockedIpCard";

interface BlacklistSectionProps {
  blacklist: BlockedIp[] | null;
  onUnblock: (entry: BlockedIp) => void;
  onRetry: () => void;
}

const MINUTE = 60_000;

/** Gesperrte IPs (v1 DDoSProtectionTab): Suche, Filter nach Art, echte Nutzer zuerst, Karten zum Aufklappen. */
export default function BlacklistSection({ blacklist, onUnblock, onRetry }: BlacklistSectionProps) {
  const t = useSecurityTexts().firewall;
  const now = useNow(MINUTE).getTime();
  const [group, setGroup] = useState<BlockGroup>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const counts = useMemo(() => groupCounts(blacklist ?? []), [blacklist]);
  const list = useMemo(() => filterBlacklist(blacklist ?? [], group, query), [blacklist, group, query]);

  if (blacklist === null) {
    return (
      <GlassSection label={t.list}>
        <PartError onRetry={onRetry} />
      </GlassSection>
    );
  }
  return (
    <div className="space-y-4">
      <GlassSearchField value={query} onChange={setQuery} placeholder={t.search} />
      <GlassFilterChips label={t.filter} layoutId="security-block-group" active={group} onChange={setGroup} options={BLOCK_GROUPS.map((id) => ({ id, label: t.groups[id], count: counts[id] }))} />
      <section aria-label={t.list}>
        <h3 className={GLASS_LABEL}>{t.shown(list.length, blacklist.length)}</h3>
        {list.length === 0 ? (
          <p className={`glass-surface rounded-[26px] ${EMPTY_ROW}`}>{blacklist.length === 0 ? t.empty : t.emptyFiltered}</p>
        ) : (
          <ul className="space-y-2.5">
            {list.map((b) => (
              <BlockedIpCard key={b.ip} entry={b} now={now} expanded={expanded === b.ip} onToggle={(ip) => setExpanded((cur) => (cur === ip ? null : ip))} onUnblock={onUnblock} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
