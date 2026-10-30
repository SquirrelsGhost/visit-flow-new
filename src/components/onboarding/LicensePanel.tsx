import { formatEuro, LICENSE_PRICE, LICENSES } from "../../lib/onboarding/licenses";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import LicenseAssignList from "./LicenseAssignList";
import LicenseCounter from "./LicenseCounter";
import LicensePresets from "./LicensePresets";
import LicenseTotal from "./LicenseTotal";
import { PANEL } from "./onboardingClasses";
import StepLabel from "./StepLabel";

interface LicensePanelProps {
  licenses: number;
  onLicenses: (value: number) => void;
  slots: string[];
  assigned: number;
  onSlot: (index: number, value: string) => void;
}

/** Schritt 2: Einzel-Lizenzen buchen, optional direkt zuweisen, Monatssumme. */
export default function LicensePanel({ licenses, onLicenses, slots, assigned, onSlot }: LicensePanelProps) {
  return (
    <section className={`${PANEL} space-y-4`}>
      <StepLabel step={2} label={T.stepLicenses}>
        <LicensePresets value={licenses} onChange={onLicenses} />
      </StepLabel>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-xs text-muted-foreground">{T.licenseHint(LICENSES.min)}</p>
        <span className="text-xs font-bold text-foreground">{T.perLicense(formatEuro(LICENSE_PRICE))}</span>
      </div>
      <LicenseCounter value={licenses} onChange={onLicenses} />
      <LicenseAssignList slots={slots} assigned={assigned} onSlot={onSlot} />
      <LicenseTotal licenses={licenses} />
    </section>
  );
}
