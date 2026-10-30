import { Mail, ShieldCheck } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import CodeInput from "./CodeInput";
import InfoNote from "./InfoNote";

interface StepCodeProps {
  /** Erste Adresse oder Firmenadresse; die Firmenvariante zeigt den blauen Hinweis aus v1. */
  variant: "primary" | "company";
  email: string;
  value: string;
  onChange: (value: string) => void;
}

/** Code-Eingabe für die erste Adresse oder die Firmenadresse. */
export default function StepCode({ variant, email, value, onChange }: StepCodeProps) {
  const { t } = useTranslation();
  const company = variant === "company";
  return (
    <div className="space-y-4">
      {company ? (
        <InfoNote Icon={Mail} tone="blue" title={t("register.security.companyCodeTitle")} text={t("register.secondaryCodeSentTo").replace("{email}", email)} />
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <ShieldCheck className="h-7 w-7 text-red-600" strokeWidth={1.75} />
          </div>
          <p className="text-sm text-muted-foreground">{t("register.codeSentTo").replace("{email}", email)}</p>
        </div>
      )}
      <CodeInput
        id={company ? "register-secondary-verification-code" : "verification-code"}
        label={company ? t("register.companyVerificationCode") : t("register.verificationCode")}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
