// Needs state and event listeners to reflect contract & Online-Ident status
"use client";

import { FileSignature, FileText, Fingerprint, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "../../hooks/useTranslation";
import { generateAndDownloadSecurityPdf } from "../../lib/security/generateSecurityPdf";
import {
  getAcceptedTerms,
  getLeaderIdent,
  openLeaderIdentModal,
  openSecurityContractModal,
  SECURITY_CONTRACT_UPDATED_EVENT,
} from "../../lib/security/securityContractStore";
import { securityGateTexts } from "../../texts/securityGateTexts";
import { settingsTexts } from "../../texts/settingsTexts";
import BiometricRow from "./BiometricRow";
import ConsentRow from "./ConsentRow";
import SettingsGroup from "./SettingsGroup";
import SettingsRow from "./SettingsRow";
import SettingsTabBody from "./SettingsTabBody";

const PRIVACY_HREF = "/privacy-settings";
const groups = settingsTexts.groups;

/**
 * Reiter Sicherheit (v1 SecuritySettings): Anmeldung, Datenschutz mit "Datenschutz & meine Daten"
 * (Art. 15, 17, 21 DSGVO), Einwilligungen, Sicherheitsrichtlinien-PDF & Online-Ident (KYC).
 */
export interface SecuritySettingsProps { readonly _?: never; }

export default function SecuritySettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((v) => v + 1);
    window.addEventListener(SECURITY_CONTRACT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(SECURITY_CONTRACT_UPDATED_EVENT, refresh);
  }, []);

  const accepted = getAcceptedTerms(user?.id);
  const ident = getLeaderIdent(user?.id);

  const handleDownloadPdf = async () => {
    await generateAndDownloadSecurityPdf({
      userName: user?.name || "Nutzer",
      userEmail: user?.email || "",
      userRole: user?.role || "Partner",
      userAddress: accepted?.address,
      fingerprint: accepted?.fingerprint,
      acceptedAt: accepted?.acceptedAt,
      signatureDataUrl: accepted?.signaturePng,
      leaderIdent: ident,
    });
  };

  return (
    <SettingsTabBody>
      <SettingsGroup label={groups.signIn} footer={t("settings.security.infoDescription")}>
        <BiometricRow />
      </SettingsGroup>
      <SettingsGroup label={groups.privacy} footer={settingsTexts.consentFooter}>
        <SettingsRow icon={ShieldCheck} tone="green" title={settingsTexts.privacyTitle} subtitle={settingsTexts.privacyText} href={PRIVACY_HREF} />
        <ConsentRow />
      </SettingsGroup>
      <SettingsGroup label={groups.documents}>
        <SettingsRow
          icon={FileText}
          tone="gray"
          title={settingsTexts.pdfTitle}
          subtitle={settingsTexts.pdfText}
          value="PDF"
          onClick={() => void handleDownloadPdf()}
        />
        <SettingsRow
          icon={FileSignature}
          tone="green"
          title={securityGateTexts.settingsContractTitle}
          subtitle={securityGateTexts.settingsContractText}
          value={accepted ? accepted.version : "Signieren"}
          onClick={openSecurityContractModal}
        />
        <SettingsRow
          icon={Fingerprint}
          tone="blue"
          title={securityGateTexts.settingsIdentTitle}
          subtitle={securityGateTexts.settingsIdentText}
          value={ident ? ident.verificationHash : securityGateTexts.identBadgePending}
          onClick={openLeaderIdentModal}
        />
      </SettingsGroup>
    </SettingsTabBody>
  );
}
