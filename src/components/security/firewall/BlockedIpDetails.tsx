import { Unlock } from "lucide-react";
import { formatStamp, useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { countryFlag } from "../../../lib/security/securityLogic";
import type { BlockedIp } from "../../../lib/security/securityTypes";
import { GLASS_INSET } from "../../glass/glassStyles";
import Fact from "../shared/Fact";
import Mono from "../shared/Mono";
import RowButton from "../shared/RowButton";

interface BlockedIpDetailsProps {
  entry: BlockedIp;
  onUnblock: () => void;
}

/** Aufgeklappte Sperre: Grund, Herkunft, letzte Anmeldung, Zähler, Zeitraum, Browser und Entsperren. */
export default function BlockedIpDetails({ entry: b, onUnblock }: BlockedIpDetailsProps) {
  const t = useSecurityTexts();
  const f = t.firewall;
  const origin = [b.city, b.country].filter(Boolean).join(", ");
  return (
    <div className="space-y-3 px-4 pb-4">
      <div className={`${GLASS_INSET} grid grid-cols-2 gap-x-4 gap-y-3 p-3.5`}>
        <Fact label={f.reason} wide>
          {b.reason || "–"}
        </Fact>
        {(origin || b.isp) && (
          <Fact label={f.origin} wide>
            {countryFlag(b.countryCode)} {[origin, b.isp].filter(Boolean).join(" · ")}
          </Fact>
        )}
        {b.email && (
          <Fact label={f.email} wide>
            {b.email}
          </Fact>
        )}
        <Fact label={f.requests}>{b.requestCount.toLocaleString(t.locale)}</Fact>
        <Fact label={f.violations}>{b.violations}</Fact>
        <Fact label={f.since}>{formatStamp(t, b.blockedAt)}</Fact>
        <Fact label={f.until}>{b.isPermanent || !b.blockedUntil ? f.forever : formatStamp(t, b.blockedUntil)}</Fact>
        {b.userAgent && (
          <Fact label={f.agent} wide>
            <Mono>{b.userAgent}</Mono>
          </Fact>
        )}
      </div>
      <div className="flex justify-end">
        <RowButton label={f.unblock} icon={Unlock} ariaLabel={`${f.unblock} ${b.ip}`} onClick={onUnblock} />
      </div>
    </div>
  );
}
