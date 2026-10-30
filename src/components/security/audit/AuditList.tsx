// Aufklappen lebt im Browser
"use client";

import { useState } from "react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { AUDIT_LIMIT, type AuditEntry } from "../../../lib/security/securityTypes";
import { GLASS_FOOTER, GLASS_LABEL } from "../../glass/glassStyles";
import { EMPTY_ROW } from "../securityStyles";
import AuditCard from "./AuditCard";

interface AuditListProps {
  logs: AuditEntry[];
  total: number;
  filtered: boolean;
  onRemove: (entry: AuditEntry) => void;
}

/** Protokolleinträge, neueste zuerst; der Hinweis unten erklärt die Grenze von 100 Einträgen je Abfrage. */
export default function AuditList({ logs, total, filtered, onRemove }: AuditListProps) {
  const t = useSecurityTexts().audit;
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <section aria-label={t.list}>
      <h3 className={GLASS_LABEL}>{t.shown(logs.length, Math.max(total, logs.length))}</h3>
      {logs.length === 0 ? (
        <p className={`glass-surface rounded-[26px] ${EMPTY_ROW}`}>{filtered ? t.emptyFiltered : t.empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {logs.map((l) => (
            <AuditCard key={l.id} entry={l} expanded={expanded === l.id} onToggle={(id) => setExpanded((cur) => (cur === id ? null : id))} onRemove={onRemove} />
          ))}
        </ul>
      )}
      {total > AUDIT_LIMIT && <p className={GLASS_FOOTER}>{t.limitHint}</p>}
    </section>
  );
}
