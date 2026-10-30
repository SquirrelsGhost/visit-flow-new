// Filter Offen/Alle lebt im Browser
"use client";

import { useState } from "react";
import { useNow } from "../../../hooks/useNow";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { ageOf, openAlerts, sortAlerts } from "../../../lib/security/securityLogic";
import type { SecurityAlert } from "../../../lib/security/securityTypes";
import GlassSection from "../../glass/GlassSection";
import MiniToggle from "../shared/MiniToggle";
import PartError from "../shared/PartError";
import { CARD_HEAD, EMPTY_ROW } from "../securityStyles";
import AlertRow from "./AlertRow";

interface AlertsCardProps {
  alerts: SecurityAlert[] | null;
  onAcknowledge: (alert: SecurityAlert) => void;
  onRetry: () => void;
}

type Show = "open" | "all";
const MINUTE = 60_000;
/** Ohne Filter "Alle" höchstens so viele, damit die Karte neben der rechten Spalte nicht davonläuft. */
const MAX_ALL = 8;

/** Sicherheitsalarme (v1 SecurityAlertsPanel): offene zuerst, kritische vor Warnungen, bestätigen per Knopf. */
export default function AlertsCard({ alerts, onAcknowledge, onRetry }: AlertsCardProps) {
  const t = useSecurityTexts();
  const now = useNow(MINUTE).getTime();
  const [show, setShow] = useState<Show>("open");
  const open = alerts ? openAlerts(alerts) : [];
  const list = sortAlerts(show === "open" ? open : (alerts ?? [])).slice(0, show === "open" ? undefined : MAX_ALL);
  return (
    <GlassSection label={t.alerts.label} footer={t.alerts.footer}>
      <div className={`${CARD_HEAD} pb-3`}>
        <span className="text-[13px] font-medium text-muted-foreground">{t.alerts.head}</span>
        <MiniToggle
          label={t.alerts.filter}
          layoutId="security-alerts-filter"
          active={show}
          onChange={setShow}
          options={[
            { id: "open", label: t.alerts.open, count: open.length },
            { id: "all", label: t.alerts.all, count: alerts?.length ?? 0 },
          ]}
        />
      </div>
      {alerts === null ? (
        <PartError onRetry={onRetry} />
      ) : list.length === 0 ? (
        <p className={EMPTY_ROW}>{show === "open" ? t.alerts.empty : t.alerts.emptyAll}</p>
      ) : (
        list.map((alert) => <AlertRow key={alert.id} alert={alert} age={ageOf(Date.parse(alert.timestamp), now)} onAcknowledge={onAcknowledge} />)
      )}
    </GlassSection>
  );
}
