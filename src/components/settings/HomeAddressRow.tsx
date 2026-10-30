import { Check, Home } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "../../hooks/useTranslation";
import { geocodeAddress } from "../../lib/settings/geocodeAddress";
import { formatAddress, type HomeAddress } from "../../lib/settings/userSettings";
import { settingsTexts } from "../../texts/settingsTexts";
import SettingsActionButton from "./SettingsActionButton";
import SettingsExpandRow from "./SettingsExpandRow";
import SettingsField from "./SettingsField";

interface HomeAddressRowProps {
  saved?: HomeAddress;
  onSave: (address: HomeAddress) => void;
}

type Draft = Pick<HomeAddress, "street" | "houseNumber" | "zipCode" | "city">;

/** Hausadresse für Routenplanung (v1 PersonalSettings): aufklappen, eintragen, Koordinaten über Mapbox ermitteln. */
export default function HomeAddressRow({ saved, onSave }: HomeAddressRowProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Draft>({ street: saved?.street ?? "", houseNumber: saved?.houseNumber ?? "", zipCode: saved?.zipCode ?? "", city: saved?.city ?? "" });
  const [busy, setBusy] = useState(false);
  const bind = (key: keyof Draft) => ({ value: draft[key], onChange: (e: { target: { value: string } }) => setDraft((d) => ({ ...d, [key]: e.target.value })) });

  const save = async () => {
    const address: Draft = { street: draft.street.trim(), houseNumber: draft.houseNumber.trim(), zipCode: draft.zipCode.trim(), city: draft.city.trim() };
    if (Object.values(address).some((part) => !part)) {
      toast.error(t("settings.personal.fillAllFields"));
      return;
    }
    setBusy(true);
    const point = await geocodeAddress(formatAddress(address));
    onSave(point ? { ...address, ...point } : address);
    setBusy(false);
    if (point) toast.success(t("settings.personal.homeAddressSaved"));
    else toast.warning(t("settings.personal.addressSavedNoCoords"));
  };

  return (
    <SettingsExpandRow icon={Home} tone="blue" title={t("settings.personal.homeAddress")} subtitle={saved ? formatAddress(saved) : settingsTexts.homeEmpty}>
      <p className="text-[12px] text-muted-foreground">{t("settings.personal.homeAddressDescription")}</p>
      <div className="grid grid-cols-3 gap-2">
        <SettingsField className="col-span-2" label={t("settings.personal.street")} autoComplete="address-line1" {...bind("street")} />
        <SettingsField label={t("settings.personal.number")} {...bind("houseNumber")} />
        <SettingsField label={t("settings.personal.zipCode")} inputMode="numeric" autoComplete="postal-code" {...bind("zipCode")} />
        <SettingsField className="col-span-2" label={t("settings.personal.city")} autoComplete="address-level2" {...bind("city")} />
      </div>
      <SettingsActionButton icon={Check} label={t("settings.personal.saveHomeAddress")} busyLabel={t("settings.personal.saving")} busy={busy} onClick={save} />
    </SettingsExpandRow>
  );
}
