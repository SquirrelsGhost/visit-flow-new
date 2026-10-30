import { UserCheck, UserX } from "lucide-react";
import { formatStamp, useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { BlockedAccount } from "../../../lib/security/securityTypes";
import GlassIcon from "../../glass/GlassIcon";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import { GLASS_ROW } from "../../glass/glassStyles";
import PartError from "../shared/PartError";
import RowButton from "../shared/RowButton";

interface AccountsCardProps {
  accounts: BlockedAccount[] | null;
  onUnblock: (account: BlockedAccount) => void;
  onRetry: () => void;
}

/** Gesperrte Benutzerkonten (v1 Benutzer-Reiter, Warnliste) mit Grund und Ablauf; Freigeben per Knopf. */
export default function AccountsCard({ accounts, onUnblock, onRetry }: AccountsCardProps) {
  const t = useSecurityTexts();
  return (
    <GlassSection label={t.accounts.label} footer={t.accounts.footer}>
      {accounts === null ? (
        <PartError onRetry={onRetry} />
      ) : accounts.length === 0 ? (
        <GlassRow icon={UserCheck} tone="green" title={t.accounts.empty} />
      ) : (
        accounts.map((a) => (
          <div key={a.id} className={GLASS_ROW}>
            <GlassIcon icon={UserX} tone="rose" />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold leading-tight text-foreground">{a.name}</span>
              <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                {[t.role(a.role), a.reason, a.until && t.accounts.until(formatStamp(t, a.until))].filter(Boolean).join(" · ")}
              </span>
            </div>
            <RowButton label={t.accounts.unblock} ariaLabel={`${t.accounts.unblock}: ${a.name}`} onClick={() => onUnblock(a)} />
          </div>
        ))
      )}
    </GlassSection>
  );
}
