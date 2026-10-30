import { Mail, User } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import FormField from "../auth/FormField";

interface StepDataProps {
  name: string;
  email: string;
  onName: (value: string) => void;
  onEmail: (value: string) => void;
}

const ICON = "h-[18px] w-[18px]";

/** Schritt 1: Vor- und Nachname, E-Mail-Adresse. */
export default function StepData({ name, email, onName, onEmail }: StepDataProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <FormField
        id="register-name"
        label={t("register.fullName")}
        value={name}
        onChange={onName}
        placeholder={t("register.fullNamePlaceholder")}
        required
        icon={<User className={ICON} strokeWidth={1.75} />}
        autoComplete="name"
        maxLength={50}
        data-testid="register-name"
      />
      <FormField
        id="register-email"
        label={t("register.email")}
        type="email"
        value={email}
        onChange={onEmail}
        placeholder={t("register.emailPlaceholder")}
        required
        icon={<Mail className={ICON} strokeWidth={1.75} />}
        autoComplete="email"
        data-testid="register-email"
      />
    </div>
  );
}
