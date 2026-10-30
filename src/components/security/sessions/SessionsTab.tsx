import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import GlassBody from "../../glass/GlassBody";
import GlassFlow from "../../glass/GlassFlow";
import GlassFlowItem from "../../glass/GlassFlowItem";
import GlassSection from "../../glass/GlassSection";
import PartError from "../shared/PartError";
import type { SecurityTabProps } from "../shared/tabProps";
import AntiCopyStats from "./AntiCopyStats";
import DevicesCard from "./DevicesCard";
import HoneypotCard from "./HoneypotCard";
import MultiLoginCard from "./MultiLoginCard";
import SessionsCard from "./SessionsCard";
import TermsCard from "./TermsCard";
import ThreatsCard from "./ThreatsCard";

/**
 * Reiter "Sitzungen" (v1 Anti-Copy Schutz + Honeypot): Kopf mit den Zahlen des Kopierschutzes, ab iPad quer
 * links Personen (Sitzungen, Mehrfach-Logins, Geräte, Vereinbarung), rechts Angreifer (verdächtige IPs, Fallen).
 */
export type SessionsTabProps = SecurityTabProps;

export default function SessionsTab({ state, snapshot, onAsk }: SessionsTabProps) {
  const t = useSecurityTexts();
  const report = snapshot.antiCopy;
  const retry = () => void state.reload();
  return (
    <GlassBody layout="wide">
      {report ? (
        <AntiCopyStats report={report} />
      ) : (
        <GlassSection label={t.antiCopy.label}>
          <PartError onRetry={retry} />
        </GlassSection>
      )}
      <GlassFlow>
        {report && <GlassFlowItem><SessionsCard sessions={report.sessions} /></GlassFlowItem>}
        {report && <GlassFlowItem><MultiLoginCard alerts={report.multiLogins} /></GlassFlowItem>}
        {report && <GlassFlowItem><DevicesCard bindings={report.devices} /></GlassFlowItem>}
        {report && (
          <GlassFlowItem col="right">
            <ThreatsCard
              threats={report.threats}
              emails={Object.fromEntries([...report.devices, ...report.sessions].map((x) => [x.userId, x.email]))}
              onClear={(x) => onAsk({ title: t.threats.confirmTitle(x.ip), text: t.threats.confirmText, label: t.threats.unblock, danger: x.score >= 75, run: () => state.clearThreat(x.ip) })}
            />
          </GlassFlowItem>
        )}
        <GlassFlowItem col="right">
          <HoneypotCard
            honeypot={snapshot.honeypot}
            onRetry={retry}
            onReport={(i) => onAsk({ title: t.honeypot.confirmTitle(i.ip), text: t.honeypot.confirmText, label: t.honeypot.report, run: () => state.reportIntruder(i.id, i.ip, t.honeypot.note(new Date().toLocaleString(t.locale))) })}
          />
        </GlassFlowItem>
        {report && <GlassFlowItem><TermsCard terms={report.terms} /></GlassFlowItem>}
      </GlassFlow>
    </GlassBody>
  );
}
