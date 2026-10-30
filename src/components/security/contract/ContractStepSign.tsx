import { RotateCcw } from "lucide-react";
import { useState } from "react";
import SignaturePad from "@/components/assistant/forms/SignaturePad";
import IdentFieldGroup from "@/components/security/ident/IdentFieldGroup";
import { contractWizardTexts } from "@/texts/contractWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";
import ContractConsent from "./ContractConsent";

interface ContractStepSignProps {
  isLeader: boolean;
  signaturePng: string | null;
  onSignature: (png: string | null) => void;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** Schritt 3: Unterschriftenfeld und verbindliche Annahme (Text je nach Rolle, Inhalt unverändert). */
export default function ContractStepSign({ isLeader, signaturePng, onSignature, checked, onCheckedChange }: ContractStepSignProps) {
  // Nur eine beim Öffnen schon vorhandene Unterschrift als Bild zeigen, nicht die gerade entstehende.
  const [saved, setSaved] = useState(signaturePng);
  const redo = () => {
    setSaved(null);
    onSignature(null);
  };
  return (
    <div className="space-y-7">
      <IdentFieldGroup label={contractWizardTexts.signGroup}>
        {saved ? (
          <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-[var(--glass-divider)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- lokale Daten-URL der Unterschrift */}
            <img src={saved} alt={contractWizardTexts.signSaved} className="block h-[150px] w-full object-contain" />
            <button type="button" onClick={redo} className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-slate-900/[0.06] px-2.5 py-1 text-[12px] font-semibold text-slate-700">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {contractWizardTexts.signAgain}
            </button>
          </div>
        ) : (
          <SignaturePad title={securityGateTexts.gateStep3Label} onChange={onSignature} />
        )}
        <p className="px-1 pt-2 text-[12px] text-[var(--glass-label)]">{contractWizardTexts.signHint}</p>
      </IdentFieldGroup>
      <ContractConsent text={isLeader ? securityGateTexts.gateCheckboxLeader : securityGateTexts.gateCheckboxStandard} checked={checked} onChange={onCheckedChange} />
    </div>
  );
}
