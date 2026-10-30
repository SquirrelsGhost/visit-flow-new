// Filter, Laden und Sheets leben im Browser
"use client";

import { useState } from "react";
import { useAuditLog } from "../../../hooks/useAuditLog";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import GlassBody from "../../glass/GlassBody";
import GlassSection from "../../glass/GlassSection";
import GlassSplit from "../../glass/GlassSplit";
import { GLASS_CARD } from "../../glass/glassStyles";
import type { SecurityConfirm } from "../shared/ConfirmSheet";
import PartError from "../shared/PartError";
import AuditFilters from "./AuditFilters";
import AuditList from "./AuditList";
import AuditTools from "./AuditTools";
import CleanupSheet from "./CleanupSheet";

interface AuditTabProps {
  onAsk: (confirm: SecurityConfirm) => void;
}

const PULSE = "animate-pulse motion-reduce:animate-none";

/**
 * Reiter "Protokoll" (v1 AuditLogViewer): links Suche, Bereich und Werkzeuge (Export, Bereinigen),
 * rechts die Einträge. Lädt erst, wenn der Reiter zum ersten Mal geöffnet wird.
 */
export default function AuditTab({ onAsk }: AuditTabProps) {
  const t = useSecurityTexts();
  const a = useAuditLog();
  const [cleanup, setCleanup] = useState(false);
  const filtered = a.filter.category !== "all" || a.filter.query.trim() !== "";
  return (
    <>
      <GlassBody layout="wide">
        <GlassSplit
          sticky
          aside={
            <>
              <AuditFilters filter={a.filter} onChange={a.setFilter} />
              <AuditTools onExport={() => void a.exportCsv()} onCleanup={() => setCleanup(true)} />
            </>
          }
        >
          {a.failed && (
            <GlassSection>
              <PartError onRetry={() => void a.reload()} />
            </GlassSection>
          )}
          {a.logs === null ? (
            <div aria-busy className="space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`${GLASS_CARD} ${PULSE} h-[68px]`} />
              ))}
            </div>
          ) : (
            <AuditList
              logs={a.logs}
              total={a.total}
              filtered={filtered}
              onRemove={(l) => onAsk({ title: t.audit.confirmTitle, text: t.audit.confirmText, label: t.audit.remove, danger: true, run: () => a.remove(l.id) })}
            />
          )}
        </GlassSplit>
      </GlassBody>
      <CleanupSheet open={cleanup} onClose={() => setCleanup(false)} onCleanup={a.cleanup} />
    </>
  );
}
