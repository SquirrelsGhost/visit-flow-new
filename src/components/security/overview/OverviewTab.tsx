import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { SecurityTab } from "../../../lib/security/securityTypes";
import GlassBody from "../../glass/GlassBody";
import GlassFlow from "../../glass/GlassFlow";
import GlassFlowItem from "../../glass/GlassFlowItem";
import type { SecurityTabProps } from "../shared/tabProps";
import AccountsCard from "./AccountsCard";
import AlertsCard from "./AlertsCard";
import LoginLocksCard from "./LoginLocksCard";
import OverviewLinks from "./OverviewLinks";
import SecurityHero from "./SecurityHero";

interface OverviewTabProps extends SecurityTabProps {
  onOpen: (tab: SecurityTab) => void;
}

/**
 * Reiter "Lage": Kopfkarte über die volle Breite, darunter ab iPad quer zwei feste Spalten.
 * Links Alarme und gesperrte Konten, rechts Login-Sperren und die Wege in die anderen Reiter.
 */
export default function OverviewTab({ state, snapshot, onAsk, onOpen }: OverviewTabProps) {
  const t = useSecurityTexts();
  return (
    <GlassBody layout="wide">
      <SecurityHero snapshot={snapshot} refreshing={state.refreshing} onRefresh={() => void state.reload()} />
      <GlassFlow>
        <GlassFlowItem>
          <AlertsCard
            alerts={snapshot.alerts}
            onRetry={() => void state.reload()}
            onAcknowledge={(alert) => void state.acknowledge(alert.id)}
          />
        </GlassFlowItem>
        <GlassFlowItem>
          <AccountsCard
            accounts={snapshot.accounts}
            onRetry={() => void state.reload()}
            onUnblock={(a) => onAsk({ title: t.accounts.confirmTitle(a.name), text: t.accounts.confirmText, label: t.accounts.unblock, run: () => state.unblockAccount(a.id, a.name) })}
          />
        </GlassFlowItem>
        <GlassFlowItem col="right">
          <LoginLocksCard
            login={snapshot.login}
            onRetry={() => void state.reload()}
            onUnlock={(lock) => onAsk({ title: t.login.confirmTitle(lock.ip), text: t.login.confirmText, label: t.login.unlock, run: () => state.unlockLogin(lock.ip) })}
          />
        </GlassFlowItem>
        <GlassFlowItem col="right">
          <OverviewLinks snapshot={snapshot} onOpen={onOpen} />
        </GlassFlowItem>
      </GlassFlow>
    </GlassBody>
  );
}
