import { Lock, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useLoginValidation } from "../../hooks/useLoginValidation";
import { useTranslation } from "../../hooks/useTranslation";
import { redirectTarget } from "../../lib/auth/redirectTarget";
import { riseIn, staggerParent } from "../../lib/motion/presets";
import FormField from "./FormField";
import LoginErrorBox from "./LoginErrorBox";
import LoginSubmitButton from "./LoginSubmitButton";
import RememberMeToggle from "./RememberMeToggle";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

/** Anmeldeformular aus v1, Felder erscheinen nacheinander. Nach dem Login geht es zur ursprünglich gewünschten Seite oder zum Dashboard. */
export default function LoginForm({ email, setEmail, password, setPassword }: LoginFormProps) {
  const router = useRouter();
  const from = useSearchParams().get("from");
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();
  const validation = useLoginValidation();
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busy = isLoading || isSubmitting;
  const trimmedEmail = email.trim();
  const forgotHref = `/forgot-password${trimmedEmail ? `?email=${encodeURIComponent(trimmedEmail)}` : ""}`;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validation.checkAll(email, password)) return;
    setIsSubmitting(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) router.replace(redirectTarget(from));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={staggerParent(0.06, 0.2)}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence initial={false}>
        {error && error.type !== "validation" && <LoginErrorBox key="error" message={error.message} />}
      </AnimatePresence>
      <motion.div variants={riseIn}>
        <FormField
          id="email"
          label={t("auth.emailOrName")}
          value={email}
          onChange={(value) => {
            setEmail(value);
            clearError();
            validation.clearField("emailOrName");
          }}
          onBlur={() => validation.checkField("emailOrName", email, password)}
          placeholder={t("auth.emailOrNamePlaceholder")}
          error={validation.errors.emailOrName}
          required
          icon={<User className="h-5 w-5" />}
          autoComplete="username"
          data-testid="login-email"
        />
      </motion.div>
      <motion.div variants={riseIn}>
        <FormField
          id="password"
          label={t("auth.password")}
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearError();
            validation.clearField("password");
          }}
          onBlur={() => validation.checkField("password", email, password)}
          placeholder={t("auth.passwordPlaceholder")}
          error={validation.errors.password}
          required
          icon={<Lock className="h-5 w-5" />}
          showPasswordToggle
          autoComplete="current-password"
          data-testid="login-password"
        />
      </motion.div>
      <motion.div variants={riseIn} className="flex items-center justify-between">
        <RememberMeToggle checked={rememberMe} onChange={setRememberMe} label={t("auth.rememberMe")} />
        <a
          href={forgotHref}
          className="relative text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
        >
          {t("auth.forgotPassword")}
        </a>
      </motion.div>
      <motion.div variants={riseIn}>
        <LoginSubmitButton
          busy={busy}
          disabled={busy || !trimmedEmail || !password.trim() || validation.hasErrors}
          label={t("auth.login")}
          busyLabel={t("auth.loggingIn")}
        />
      </motion.div>
    </motion.form>
  );
}
