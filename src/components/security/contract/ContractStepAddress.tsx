import { MapPin } from "lucide-react";
import { useState } from "react";
import IdentField from "@/components/security/ident/IdentField";
import IdentFieldGroup from "@/components/security/ident/IdentFieldGroup";
import { contractWizardTexts } from "@/texts/contractWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";
import ContractPdfCard from "./ContractPdfCard";

interface ContractStepAddressProps {
  address: string;
  onAddressChange: (value: string) => void;
  addressValid: boolean;
  /** Nach einem Versuch ohne gültige Anschrift den Fehler auch ohne Verlassen des Felds zeigen. */
  showError: boolean;
  pdfDownloaded: boolean;
  onDownload: () => Promise<void>;
}

/** Schritt 2: Anschrift für § 10 mit Prüfung direkt am Feld, darunter das persönliche PDF zum Laden und Prüfen. */
export default function ContractStepAddress({ address, onAddressChange, addressValid, showError, pdfDownloaded, onDownload }: ContractStepAddressProps) {
  const [touched, setTouched] = useState(false);
  return (
    <div className="space-y-7">
      <IdentFieldGroup label={contractWizardTexts.addressGroup}>
        <IdentField
          id="contract-field-address"
          label={contractWizardTexts.addressLabel}
          icon={MapPin}
          value={address}
          onChange={onAddressChange}
          onBlur={() => setTouched(true)}
          placeholder={securityGateTexts.gateStep1Placeholder}
          autoComplete="street-address"
          hint={securityGateTexts.gateStep1Hint}
          error={addressValid ? null : contractWizardTexts.addressError}
          showStatus={(touched || showError) && (address.length > 0 || showError)}
        />
      </IdentFieldGroup>
      <IdentFieldGroup label={contractWizardTexts.pdfGroup}>
        <ContractPdfCard locked={!addressValid} downloaded={pdfDownloaded} onDownload={onDownload} />
      </IdentFieldGroup>
    </div>
  );
}
