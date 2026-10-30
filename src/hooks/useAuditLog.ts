import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { feedback } from "../lib/feedback/feedback";
import { cleanupAudit, deleteAuditEntry, exportAudit } from "../lib/security/securityActions";
import { loadAudit } from "../lib/security/securityApi";
import type { AuditEntry, AuditFilter } from "../lib/security/securityTypes";
import { useSecurityTexts } from "./useSecurityTexts";

const EMPTY: AuditFilter = { category: "all", query: "" };
/** Tippen in der Suche lädt erst nach einer kurzen Pause neu. */
const SEARCH_DELAY = 350;

const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

/** Audit-Protokoll (v1 AuditLogViewer): filtern, einzeln löschen, alte Einträge bereinigen, als CSV exportieren. */
export function useAuditLog() {
  const t = useSecurityTexts().audit;
  const [filter, setFilterState] = useState<AuditFilter>(EMPTY);
  const [logs, setLogs] = useState<AuditEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const request = useRef(0);

  const load = useCallback(
    async (f: AuditFilter) => {
      const id = ++request.current;
      try {
        const res = await loadAudit(f);
        if (id !== request.current) return;
        setLogs(res.logs);
        setTotal(res.total);
        setFailed(false);
      } catch {
        if (id !== request.current) return;
        setLogs((prev) => prev ?? []);
        setFailed(true);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => void load(filter), filter.query ? SEARCH_DELAY : 0);
    return () => clearTimeout(timer);
  }, [filter, load]);

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      feedback("success");
      toast.success(success);
      await load(filter);
      return true;
    } catch (e) {
      toast.error(errorText(e, t.loadError));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return {
    filter,
    setFilter: (patch: Partial<AuditFilter>) => setFilterState((f) => ({ ...f, ...patch })),
    logs,
    total,
    failed,
    busy,
    reload: () => load(filter),
    remove: (id: string) => run(() => deleteAuditEntry(id), t.removed),
    cleanup: (days: number) => run(() => cleanupAudit(days), t.cleaned),
    exportCsv: async () => {
      await exportAudit(filter, logs ?? []);
      toast.success(t.exported);
    },
  };
}

export type AuditState = ReturnType<typeof useAuditLog>;
