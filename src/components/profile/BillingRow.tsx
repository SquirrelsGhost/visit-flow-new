import { Check, MapPin } from "lucide-react";
import { useState } from "react";
import { billingLines, billingPatch } from "../../lib/profile/profileFields";
import type { BillingAddress, SaveProfile } from "../../lib/profile/profileTypes";
import { profileTexts } from "../../texts/profileTexts";
import SettingsActionButton from "../settings/SettingsActionButton";
import SettingsExpandRow from "../settings/SettingsExpandRow";
import SettingsField from "../settings/SettingsField";

interface BillingRowProps {
  billing: BillingAddress;
  onSave: SaveProfile;
}

const texts = profileTexts.personal;

/** Rechnungsadresse für Abo und Rechnungen (v1 Reiter Persönlich). */
export default function BillingRow({ billing, onSave }: BillingRowProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(billing);
  const [busy, setBusy] = useState(false);
  const lines = billingLines(billing);
  const bind = (key: keyof BillingAddress) => ({ value: draft[key], onChange: (e: { target: { value: string } }) => setDraft((d) => ({ ...d, [key]: e.target.value })) });

  const toggle = (next: boolean) => {
    if (next) setDraft(billing);
    setOpen(next);
  };

  const save = async () => {
    const t = (key: keyof BillingAddress) => draft[key].trim();
    const next: BillingAddress = { firstName: t("firstName"), lastName: t("lastName"), street: t("street"), zip: t("zip"), city: t("city"), country: t("country").toUpperCase() || "DE" };
    setBusy(true);
    const ok = await onSave(billingPatch(next), texts.saved);
    setBusy(false);
    if (ok) setOpen(false);
  };

  return (
    <SettingsExpandRow icon={MapPin} tone="indigo" title={texts.billing} subtitle={lines.length ? lines.join(", ") : texts.billingEmpty} open={open} onOpenChange={toggle}>
      <div className="grid grid-cols-2 gap-2">
        <SettingsField label={texts.firstName} autoComplete="given-name" {...bind("firstName")} />
        <SettingsField label={texts.lastName} autoComplete="family-name" {...bind("lastName")} />
        <SettingsField className="col-span-2" label={texts.street} autoComplete="address-line1" {...bind("street")} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SettingsField label={texts.zip} inputMode="numeric" autoComplete="postal-code" {...bind("zip")} />
        <SettingsField className="col-span-2" label={texts.city} autoComplete="address-level2" {...bind("city")} />
      </div>
      <SettingsField label={texts.country} autoComplete="country" maxLength={2} {...bind("country")} />
      <SettingsActionButton icon={Check} label={texts.save} busyLabel={texts.saving} busy={busy} onClick={save} />
    </SettingsExpandRow>
  );
}
