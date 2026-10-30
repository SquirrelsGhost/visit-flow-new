import { Mail, Shield } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import FormField from "../auth/FormField";
import InfoNote from "./InfoNote";

interface StepCompanyEmailProps {
  value: string;
  onChange: (value: string) => void;
}

/** Nur für Vodafone-Teams ohne Firmenadresse: zweite Adresse @vertriebspartner-vfkd.de bestätigen. */
export default function StepCompanyEmail({ value, onChange }: StepCompanyEmailProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <InfoNote Icon={Shield} tone="amber" title={t("register.security.title")} text={t("register.security.description")} />
      <FormField
        id="register-secondary-email"
        label={t("register.companyEmail")}
        type="email"
        value={value}
        onChange={onChange}
        placeholder={t("register.companyEmailPlaceholder")}
        required
        autoFocus
        icon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        autoComplete="email"
      />
    </div>
  );
}
