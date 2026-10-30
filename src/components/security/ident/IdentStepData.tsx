import { Building2, CalendarDays, Hash, Lock, MapPin, UserRound, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { GLASS_INSET } from "@/components/glass/glassStyles";
import type { IdentState } from "@/hooks/useLeaderIdent";
import { cn } from "@/lib/cn";
import { identFieldError, type IdentField as IdentFieldName } from "@/lib/security/identWizard";
import { identWizardTexts } from "@/texts/identWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";
import IdentDocTypePicker from "./IdentDocTypePicker";
import IdentField from "./IdentField";
import IdentFieldGroup from "./IdentFieldGroup";

interface IdentStepDataProps {
  state: IdentState;
  onChange: (patch: Partial<IdentState>) => void;
  /** Nach einem Weiter-Versuch alle Fehler zeigen, nicht erst nach dem Verlassen eines Felds. */
  showAllErrors: boolean;
}

interface FieldConfig {
  label: string;
  icon: LucideIcon;
  type?: "date";
  placeholder?: string;
  autoComplete?: string;
  mono?: boolean;
}

const FIELDS: Record<IdentFieldName, FieldConfig> = {
  fullName: { label: securityGateTexts.identFullNameLabel, icon: UserRound, autoComplete: "name" },
  birthDate: { label: securityGateTexts.identBirthDateLabel, icon: CalendarDays, type: "date", autoComplete: "bday" },
  docNumber: { label: securityGateTexts.identDocNumberLabel, icon: Hash, placeholder: securityGateTexts.identDocNumberPlaceholder, mono: true },
  authority: { label: securityGateTexts.identAuthorityLabel, icon: Building2, placeholder: securityGateTexts.identAuthorityPlaceholder },
  address: { label: securityGateTexts.identAddressLabel, icon: MapPin, placeholder: securityGateTexts.identAddressPlaceholder, autoComplete: "street-address" },
};

/** Schritt 1: Ausweisdaten in drei ruhigen Gruppen, Prüfung direkt am Feld. */
export default function IdentStepData({ state, onChange, showAllErrors }: IdentStepDataProps) {
  const [touched, setTouched] = useState<Partial<Record<IdentFieldName, boolean>>>({});

  const field = (name: IdentFieldName) => {
    const config = FIELDS[name];
    const error = identFieldError(name, state[name]);
    const showStatus = Boolean(showAllErrors || touched[name]);
    return (
      <IdentField
        id={`ident-field-${name}`}
        label={config.label}
        icon={config.icon}
        type={config.type}
        placeholder={config.placeholder}
        autoComplete={config.autoComplete}
        mono={config.mono}
        hint={identWizardTexts.fieldHints[name] || undefined}
        value={state[name]}
        onChange={(value) => onChange({ [name]: value })}
        onBlur={() => setTouched((t) => ({ ...t, [name]: true }))}
        error={error ? identWizardTexts.errors[error] : null}
        showStatus={showStatus}
      />
    );
  };

  return (
    <div className="space-y-7">
      <div className={cn(GLASS_INSET, "flex gap-3 px-4 py-3.5")}>
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <p className="text-[12px] leading-snug text-muted-foreground">
          <span className="block pb-1 font-semibold text-foreground lg:hidden">{securityGateTexts.identSubtitle}</span>
          {securityGateTexts.identIntro}
        </p>
      </div>
      <IdentFieldGroup label={identWizardTexts.groups.person} className="space-y-4">
        {field("fullName")}
        {field("birthDate")}
      </IdentFieldGroup>
      <IdentFieldGroup label={identWizardTexts.groups.document} className="space-y-4">
        <IdentDocTypePicker value={state.docType} onChange={(docType) => onChange({ docType })} />
        <div className="grid gap-4 sm:grid-cols-2">
          {field("docNumber")}
          {field("authority")}
        </div>
      </IdentFieldGroup>
      <IdentFieldGroup label={identWizardTexts.groups.address}>{field("address")}</IdentFieldGroup>
    </div>
  );
}
