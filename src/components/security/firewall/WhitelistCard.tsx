import { Plus, ShieldCheck } from "lucide-react";
import { formatStamp, useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { WhitelistEntry } from "../../../lib/security/securityTypes";
import GlassIcon from "../../glass/GlassIcon";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import { GLASS_ROW } from "../../glass/glassStyles";
import Mono from "../shared/Mono";
import PartError from "../shared/PartError";
import RowButton from "../shared/RowButton";

interface WhitelistCardProps {
  whitelist: WhitelistEntry[] | null;
  onAdd: () => void;
  onRemove: (entry: WhitelistEntry) => void;
  onRetry: () => void;
}

/** IPs, die nie gesperrt werden (v1 WhitelistManagement): Notiz, wer und wann, Entfernen; oben "IP hinzufügen". */
export default function WhitelistCard({ whitelist, onAdd, onRemove, onRetry }: WhitelistCardProps) {
  const t = useSecurityTexts();
  return (
    <GlassSection label={t.whitelist.label} footer={t.whitelist.footer}>
      <GlassRow icon={Plus} tone="green" title={t.whitelist.add} onClick={onAdd} />
      {whitelist === null && <PartError onRetry={onRetry} />}
      {whitelist?.length === 0 && <p className="px-4 py-4 text-[13px] text-muted-foreground">{t.whitelist.empty}</p>}
      {whitelist?.map((w) => (
        <div key={w.ip} className={GLASS_ROW}>
          <GlassIcon icon={ShieldCheck} tone="green" />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold leading-tight text-foreground">
              <Mono>{w.ip}</Mono>
            </span>
            <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">{[w.comment, formatStamp(t, w.addedAt)].filter(Boolean).join(" · ")}</span>
          </div>
          <RowButton label={t.whitelist.remove} tone="slate" ariaLabel={`${t.whitelist.remove} ${w.ip}`} onClick={() => onRemove(w)} />
        </div>
      ))}
    </GlassSection>
  );
}
