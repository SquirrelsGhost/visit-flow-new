// Offene Sheets leben im Browser
"use client";

import { useState } from "react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import GlassBody from "../../glass/GlassBody";
import GlassSplit from "../../glass/GlassSplit";
import type { SecurityTabProps } from "../shared/tabProps";
import BlacklistSection from "./BlacklistSection";
import BlockIpSheet from "./BlockIpSheet";
import FirewallSummary from "./FirewallSummary";
import WhitelistAddSheet from "./WhitelistAddSheet";
import WhitelistCard from "./WhitelistCard";

/**
 * Reiter "Firewall" (v1 DDoS & Firewall + IP-Whitelist): links Kennzahlen, "IP sperren" und die Whitelist,
 * rechts die gesperrten IPs mit Suche und Filter. Die linke Spalte bleibt neben der langen Liste stehen.
 */
export type FirewallTabProps = SecurityTabProps;

export default function FirewallTab({ state, snapshot, onAsk }: FirewallTabProps) {
  const t = useSecurityTexts();
  const [sheet, setSheet] = useState<"block" | "whitelist" | null>(null);
  const retry = () => void state.reload();
  return (
    <>
      <GlassBody layout="wide">
        <GlassSplit
          sticky
          aside={
            <>
              <FirewallSummary stats={snapshot.firewall} blacklist={snapshot.blacklist} onBlock={() => setSheet("block")} />
              <WhitelistCard
                whitelist={snapshot.whitelist}
                onRetry={retry}
                onAdd={() => setSheet("whitelist")}
                onRemove={(w) => onAsk({ title: t.whitelist.confirmTitle(w.ip), text: t.whitelist.confirmText, label: t.whitelist.remove, danger: true, run: () => state.removeWhitelist(w.ip) })}
              />
            </>
          }
        >
          <BlacklistSection
            blacklist={snapshot.blacklist}
            onRetry={retry}
            onUnblock={(b) => onAsk({ title: t.firewall.confirmTitle(b.ip), text: t.firewall.confirmText, label: t.firewall.unblock, danger: b.category === "severe" || b.category === "honeypot", run: () => state.unblockIp(b.ip) })}
          />
        </GlassSplit>
      </GlassBody>
      <BlockIpSheet open={sheet === "block"} whitelisted={snapshot.whitelist?.map((w) => w.ip) ?? []} onClose={() => setSheet(null)} onBlock={state.blockIp} />
      <WhitelistAddSheet open={sheet === "whitelist"} onClose={() => setSheet(null)} onAdd={state.addWhitelist} />
    </>
  );
}
