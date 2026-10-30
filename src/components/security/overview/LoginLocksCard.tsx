import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useNow } from "../../../hooks/useNow";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { minutesLeft } from "../../../lib/security/securityLogic";
import type { LoginLock, LoginProtection } from "../../../lib/security/securityTypes";
import GlassIcon from "../../glass/GlassIcon";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import { GLASS_ROW } from "../../glass/glassStyles";
import Mono from "../shared/Mono";
import PartError from "../shared/PartError";
import RowButton from "../shared/RowButton";

interface LoginLocksCardProps {
  login: LoginProtection | null;
  onUnlock: (lock: LoginLock) => void;
  onRetry: () => void;
}

const MINUTE = 60_000;

/** Login-Schutz (v1 LoginAttemptsTable): gesperrte IPs mit E-Mail, Fehlversuchen und Restzeit, Entsperren per Knopf. */
export default function LoginLocksCard({ login, onUnlock, onRetry }: LoginLocksCardProps) {
  const t = useSecurityTexts();
  const now = useNow(MINUTE).getTime();
  return (
    <GlassSection label={t.login.label} footer={t.login.footer}>
      {login === null ? (
        <PartError onRetry={onRetry} />
      ) : (
        <>
          {login.locks.length === 0 && <GlassRow icon={ShieldCheck} tone="green" title={t.login.empty} />}
          {login.locks.map((lock) => (
            <div key={lock.ip} className={GLASS_ROW}>
              <GlassIcon icon={LockKeyhole} tone="orange" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold leading-tight text-foreground">{lock.email || <Mono>{lock.ip}</Mono>}</span>
                <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                  <Mono>{lock.ip}</Mono> · {t.login.attempts(lock.attemptCount)} · {t.login.left(minutesLeft(lock.lockedUntil, now))}
                </span>
              </div>
              <RowButton label={t.login.unlock} ariaLabel={`${t.login.unlock} ${lock.ip}`} onClick={() => onUnlock(lock)} />
            </div>
          ))}
          <p className="px-4 py-3 text-[12.5px] text-muted-foreground">{t.login.pending(login.activeAttempts)}</p>
        </>
      )}
    </GlassSection>
  );
}
