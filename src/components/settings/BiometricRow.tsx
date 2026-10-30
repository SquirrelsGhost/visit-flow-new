import { Fingerprint } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "../../hooks/useTranslation";
import { useUserSettings } from "../../hooks/useUserSettings";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { platformAuthenticatorAvailable } from "../../lib/settings/biometric";
import { settingsTexts } from "../../texts/settingsTexts";
import SettingsSwitchRow from "./SettingsSwitchRow";

/**
 * Biometrische Anmeldung (v1 SecuritySettings). v1 registrierte dafür einen WebAuthn-Schlüssel beim Server;
 * das kommt mit der Passkey-Anmeldung in v2. Die Demo schaltet nur lokal um.
 */
export interface BiometricRowProps { readonly _?: never; }

export default function BiometricRow() {
  const { t } = useTranslation();
  const { settings, update } = useUserSettings();
  const [checking, setChecking] = useState(false);

  const toggle = async () => {
    if (settings.biometricAuth) {
      update({ biometricAuth: false });
      toast.success(t("settings.security.biometricDisabled"));
      return;
    }
    if (!hasDemoSession()) {
      setChecking(true);
      const supported = await platformAuthenticatorAvailable();
      setChecking(false);
      if (supported) toast.info(settingsTexts.biometricPending);
      else toast.error(t("settings.security.biometricNotSupportedBrowser"));
      return;
    }
    update({ biometricAuth: true });
    toast.success(t("settings.security.biometricEnabledWeb"));
  };

  return (
    <SettingsSwitchRow
      icon={Fingerprint}
      tone="purple"
      title={t("settings.security.biometric")}
      subtitle={t("settings.security.biometricDescription")}
      checked={settings.biometricAuth}
      disabled={checking}
      onChange={toggle}
    />
  );
}
