import { Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "../../hooks/useTranslation";
import { SOFT_SPRING } from "../../lib/motion/presets";
import type { PasswordCheck } from "../../lib/register/passwordStrength";
import FormField from "../auth/FormField";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

interface StepPasswordProps {
  password: string;
  confirm: string;
  onPassword: (value: string) => void;
  onConfirm: (value: string) => void;
  check: PasswordCheck;
}

const ICON = <Lock className="h-[18px] w-[18px]" strokeWidth={1.75} />;

/** Letzter Schritt: Passwort mit Stärkeanzeige und Bestätigung. */
export default function StepPassword({ password, confirm, onPassword, onConfirm, check }: StepPasswordProps) {
  const { t } = useTranslation();
  const mismatch = confirm.length > 0 && confirm !== password;
  return (
    <div className="space-y-4">
      <FormField
        id="register-password"
        label={t("auth.password")}
        type="password"
        value={password}
        onChange={onPassword}
        placeholder={t("auth.passwordPlaceholder")}
        required
        autoFocus
        icon={ICON}
        showPasswordToggle
        autoComplete="new-password"
        data-testid="register-password"
      />
      <AnimatePresence initial={false}>
        {password && (
          <motion.div key="meter" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
            <PasswordStrengthMeter check={check} />
          </motion.div>
        )}
      </AnimatePresence>
      <FormField
        id="register-confirm-password"
        label={t("register.confirmPassword")}
        type="password"
        value={confirm}
        onChange={onConfirm}
        placeholder={t("auth.passwordPlaceholder")}
        required
        icon={ICON}
        showPasswordToggle
        autoComplete="new-password"
        error={mismatch ? "Passwörter stimmen nicht überein" : null}
        isValid={confirm.length > 0 && !mismatch}
        data-testid="register-confirm-password"
      />
    </div>
  );
}
