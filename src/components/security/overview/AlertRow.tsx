import { AlertTriangle, CircleAlert, Info, type LucideIcon } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { Age } from "../../../lib/security/securityLogic";
import type { AlertSeverity, SecurityAlert } from "../../../lib/security/securityTypes";
import GlassChip from "../../glass/GlassChip";
import GlassIcon from "../../glass/GlassIcon";
import { GLASS_ROW } from "../../glass/glassStyles";
import RowButton from "../shared/RowButton";
import { SEVERITY_STYLE } from "../securityStyles";

interface AlertRowProps {
  alert: SecurityAlert;
  age: Age;
  onAcknowledge: (alert: SecurityAlert) => void;
}

const ICONS: Record<AlertSeverity, LucideIcon> = { CRITICAL: AlertTriangle, WARNING: CircleAlert, INFO: Info };

/** Ein Alarm: Schwere als farbiges Symbol, Art und Zeit, Meldung; offene Alarme lassen sich bestätigen. */
export default function AlertRow({ alert, age, onAcknowledge }: AlertRowProps) {
  const t = useSecurityTexts();
  const style = SEVERITY_STYLE[alert.severity];
  return (
    <div className={`${GLASS_ROW} items-start`}>
      <GlassIcon icon={ICONS[alert.severity]} tone={alert.acknowledged ? "gray" : style.tone} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-foreground">{t.alerts.type(alert.type)}</span>
          {!alert.acknowledged && <GlassChip tone={style.chip}>{t.alerts.severity[alert.severity]}</GlassChip>}
        </div>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{alert.message}</p>
        <p className="mt-1 text-[12px] text-[var(--glass-label)]">
          {t.ago(age)}
          {alert.acknowledged && ` · ${t.alerts.acknowledged}`}
        </p>
      </div>
      {!alert.acknowledged && <RowButton label={t.alerts.acknowledge} tone="slate" onClick={() => onAcknowledge(alert)} />}
    </div>
  );
}
