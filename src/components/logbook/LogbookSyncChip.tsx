import { CloudAlert, CloudCheck, CloudOff, RefreshCw } from "lucide-react";
import type { SyncStatus } from "../../lib/logbook/logbookSyncRunner";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassChip from "../glass/GlassChip";

const ICON = { syncing: RefreshCw, synced: CloudCheck, offline: CloudOff, rejected: CloudAlert } as const;
const TONE = { syncing: "slate", synced: "green", offline: "amber", rejected: "amber" } as const;

/** Zeigt im Kopf, ob das Fahrtenbuch auf dem Server gesichert ist. In der Demo und vor dem ersten Abgleich nichts. */
export interface LogbookSyncChipProps { status: SyncStatus; t: LogbookTexts }

export default function LogbookSyncChip({ status, t }: LogbookSyncChipProps) {
  if (status === "idle") return null;
  const Icon = ICON[status];
  return (
    <span title={t.syncHint[status]} role="status" aria-label={t.syncHint[status]}>
      <GlassChip tone={TONE[status]} onDeep>
        <Icon aria-hidden className={status === "syncing" ? "h-3 w-3 motion-safe:animate-spin" : "h-3 w-3"} />
        <span className="max-sm:sr-only">{t.sync[status]}</span>
      </GlassChip>
    </span>
  );
}
