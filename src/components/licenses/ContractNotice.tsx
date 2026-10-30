import { AlertTriangle, FileSignature } from "lucide-react";
import type { LicenseContract } from "../../lib/licenses/licenseTypes";
import { licenseTexts } from "../../texts/licenseTexts";
import { fill } from "../../texts/profileTexts";
import GlassIcon from "../glass/GlassIcon";
import GlassProgress from "../glass/GlassProgress";
import GlassSection from "../glass/GlassSection";

interface ContractNoticeProps {
  contract: LicenseContract;
  licenseCount: number;
}

const texts = licenseTexts.contract;

/** Hinweis zum Sondertarif (v1 Vertragshinweis bzw. Vertragsbruch) mit Fortschritt zur Mindestmenge. */
export default function ContractNotice({ contract, licenseCount }: ContractNoticeProps) {
  const values = { min: contract.minLicenses, start: contract.startMonth, month: contract.currentMonth };
  const missing = Math.max(0, contract.minLicenses - licenseCount);
  return (
    <GlassSection>
      <div className="flex gap-3.5 px-4 py-4">
        <GlassIcon icon={contract.breached ? AlertTriangle : FileSignature} tone={contract.breached ? "red" : "amber"} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight text-foreground">{fill(texts.title, values)}</p>
          <p className={contract.breached ? "mt-1 text-[13px] leading-snug text-red-600 dark:text-red-400" : "mt-1 text-[13px] leading-snug text-muted-foreground"}>
            {contract.breached ? texts.breached : fill(texts.ok, values)}
          </p>
          {!contract.breached && (
            <div className="mt-3 space-y-1.5">
              <GlassProgress share={licenseCount / contract.minLicenses} label={fill(texts.title, values)} tone="amber" now={licenseCount} max={contract.minLicenses} />
              {missing > 0 && <p className="text-[12px] font-medium text-amber-700 dark:text-amber-300">{fill(texts.missing, { count: missing })}</p>}
            </div>
          )}
        </div>
      </div>
    </GlassSection>
  );
}
