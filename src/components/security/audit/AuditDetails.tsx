import { Trash2 } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { AuditEntry } from "../../../lib/security/securityTypes";
import { GLASS_INSET } from "../../glass/glassStyles";
import Fact from "../shared/Fact";
import Mono from "../shared/Mono";
import RowButton from "../shared/RowButton";

interface AuditDetailsProps {
  entry: AuditEntry;
  onRemove: () => void;
}

/** Aufgeklappter Protokolleintrag (v1 Detail-Dialog): Akteur, IP, Gerät, Ziel, Zusatzdaten und Löschen. */
export default function AuditDetails({ entry: l, onRemove }: AuditDetailsProps) {
  const t = useSecurityTexts().audit;
  const meta = l.metadata ? JSON.stringify(l.metadata, null, 2) : null;
  return (
    <div className="space-y-3 px-4 pb-4">
      <div className={`${GLASS_INSET} grid grid-cols-2 gap-x-4 gap-y-3 p-3.5`}>
        <Fact label={t.actor} wide>
          {[l.actorName, l.actorEmail].filter(Boolean).join(" · ") || t.system}
        </Fact>
        <Fact label={t.ip}>
          <Mono>{l.actorIp || "–"}</Mono>
        </Fact>
        {(l.targetType || l.targetId) && (
          <Fact label={t.target}>
            {l.targetType} <Mono>{l.targetId}</Mono>
          </Fact>
        )}
        {l.userAgent && (
          <Fact label={t.agent} wide>
            <Mono>{l.userAgent}</Mono>
          </Fact>
        )}
        {meta && (
          <Fact label={t.details} wide>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-[var(--glass-track)] p-2.5 font-mono text-[11.5px] leading-snug">{meta}</pre>
          </Fact>
        )}
      </div>
      <div className="flex justify-end">
        <RowButton label={t.remove} tone="red" icon={Trash2} onClick={onRemove} />
      </div>
    </div>
  );
}
