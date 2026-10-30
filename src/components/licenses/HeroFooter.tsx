import { formatDay, monthlyCost } from "../../lib/licenses/licenseLogic";
import { formatEuro, LICENSE_PRICE } from "../../lib/onboarding/licenses";
import { licenseTexts } from "../../texts/licenseTexts";
import { fill } from "../../texts/profileTexts";
import GlassNumber from "../glass/GlassNumber";

interface HeroFooterProps {
  licenseCount: number;
  renewsAt?: string;
}

const texts = licenseTexts.hero;
const LABEL = "text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--glass-label)]";

/** Ruhige Fußzeile der Kopfkarte: Monatsbetrag links, nächste Abbuchung rechts, jeweils mit kleiner Beschriftung. */
export default function HeroFooter({ licenseCount, renewsAt }: HeroFooterProps) {
  return (
    <div className="relative flex items-end justify-between gap-4 border-t border-slate-900/[0.06] pt-4 dark:border-white/10">
      <div className="min-w-0">
        <p className={LABEL}>{texts.monthly}</p>
        <p className="mt-1 whitespace-nowrap text-[22px] font-semibold tracking-[-0.025em] text-foreground">
          <GlassNumber value={monthlyCost(licenseCount)} kind="euro" duration={1.4} />
        </p>
        <p className="text-[12px] text-muted-foreground">{fill(texts.perLicense, { count: licenseCount, price: formatEuro(LICENSE_PRICE) })}</p>
      </div>
      <div className="text-right">
        <p className={LABEL}>{texts.renews}</p>
        <p className="mt-1 whitespace-nowrap text-[14px] font-semibold text-foreground">{formatDay(renewsAt)}</p>
      </div>
    </div>
  );
}
