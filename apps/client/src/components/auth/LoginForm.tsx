import { Lock, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useLoginValidation } from "../../hooks/useLoginValidation";
import { useTranslation } from "../../hooks/useTranslation";
import { redirectTarget } from "../../lib/auth/redirectTarget";
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

/** Anmeldeformular 1:1 aus v1. Nach dem Login geht es zur ursprünglich gewünschten Seite oder zum Dashboard. */
export default function LoginForm({ email, setEmail, password, setPassword }: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
      if (result.success) navigate(redirectTarget(location.state), { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && error.type !== "validation" && <LoginErrorBox message={error.message} />}
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
      <div className="flex items-center justify-between">
        <RememberMeToggle checked={rememberMe} onChange={setRememberMe} label={t("auth.rememberMe")} />
        <a
          href={forgotHref}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium"
        >
          {t("auth.forgotPassword")}
        </a>
      </div>
      <LoginSubmitButton
        busy={busy}
        disabled={busy || !trimmedEmail || !password.trim() || validation.hasErrors}
        label={t("auth.login")}
        busyLabel={t("auth.loggingIn")}
      />
    </form>
  );
}
