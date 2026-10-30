import { useEffect, useState } from "react";
import { toast } from "sonner";
import { checkPassword } from "../lib/register/passwordStrength";
import {
  completeRegistration,
  loadCompanyEmailBypass,
  loadPublicTeams,
  sendVerificationCode,
  verifyEmailCode,
  type PublicTeam,
} from "../lib/register/registerApi";
import { stepIndex, stepsFor, type RegisterStep } from "../lib/register/registerSteps";
import { CODE_LENGTH, isCompanyEmail, validateEmail, validateName, validatePasswordConfirmation } from "../lib/register/registerValidation";
import { kanonischeEmail } from "../lib/sicherheit/emailSchutz";
import type { ApiResponse } from "@/shared/api/apiResponse";
import { clearSavedRegistration, useRegisterState } from "./useRegisterState";
import { useTranslation } from "./useTranslation";

export type RegisterOutcome = "approval" | "created" | "login";

/** Ablauf der Berater-Registrierung aus v1 (RegisterForm3Step): Daten → Team → Code → ggf. Firmenmail → Passwort. */
export function useRegisterFlow(onFinished: (outcome: RegisterOutcome, email: string, password: string) => void) {
  const { t } = useTranslation();
  const form = useRegisterState();
  const { state, update } = form;
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [bypass, setBypass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    let active = true;
    void loadPublicTeams().then((list) => active && setTeams(list));
    void loadCompanyEmailBypass().then((value) => active && setBypass(value));
    return () => {
      active = false;
    };
  }, []);

  const team = teams.find((candidate) => candidate.id === state.selectedTeamId);
  const isVodafoneTeam = team?.name.toLowerCase().includes("vodafone") ?? false;
  const needsCompanyEmail = isVodafoneTeam && !isCompanyEmail(state.email) && !bypass;
  const steps = stepsFor(state.step, needsCompanyEmail);
  const passwordCheck = checkPassword(form.password);

  function go(step: RegisterStep, dir: 1 | -1 = 1) {
    setDirection(dir);
    setError(null);
    update("step", step);
  }

  const back = () => go(steps[Math.max(0, stepIndex(steps, state.step) - 1)].id, -1);

  /** Führt einen API-Schritt aus; bei Fehler Meldung im Formular und als Toast. */
  async function run<T>(request: Promise<ApiResponse<T>>, fallback: string, success: string, next: RegisterStep) {
    setError(null);
    setBusy(true);
    const response = await request;
    setBusy(false);
    if (!response.success) {
      const message = response.error || response.message || fallback;
      setError(message);
      toast.error(message);
      return;
    }
    toast.success(success);
    go(next);
  }

  function fail(message: string) {
    setError(message);
  }

  const actions: Record<RegisterStep, () => void> = {
    data: () => {
      const problem = validateName(state.name) ?? validateEmail(state.email);
      if (problem) fail(problem);
      else go("team");
    },
    team: () => void run(sendVerificationCode(state.email, state.name), t("register.codeError"), t("register.codeSent"), "code"),
    code: () => {
      if (state.verificationCode.length !== CODE_LENGTH) return fail(t("register.enterCode"));
      void run(verifyEmailCode(state.email, state.verificationCode), t("register.invalidCode"), t("register.emailVerified"), needsCompanyEmail ? "companyEmail" : "password");
    },
    companyEmail: () => {
      const problem = validateEmail(state.secondaryEmail) ?? (isCompanyEmail(state.secondaryEmail) ? null : t("register.companyEmailRequired"));
      if (problem) return fail(problem);
      void run(sendVerificationCode(state.secondaryEmail, state.name), t("register.codeError"), t("register.secondaryCodeSent"), "companyCode");
    },
    companyCode: () => {
      if (state.secondaryVerificationCode.length !== CODE_LENGTH) return fail(t("register.enterCode"));
      void run(verifyEmailCode(state.secondaryEmail, state.secondaryVerificationCode), t("register.invalidCode"), t("register.secondaryEmailVerified"), "password");
    },
    password: () => void finish(),
  };

  async function finish() {
    const problem = validatePasswordConfirmation(form.password, form.confirmPassword);
    if (problem) return fail(problem);
    if (!passwordCheck.isValid) return fail(t("register.passwordTooWeak"));
    setError(null);
    setBusy(true);
    const email = kanonischeEmail(state.email);
    const response = await completeRegistration({
      email,
      name: state.name.trim(),
      vpkn: state.vpkn.trim(),
      password: form.password,
      verificationCode: state.verificationCode,
      contractStart: state.contractStart || undefined,
      requestedTeamId: state.selectedTeamId && state.selectedTeamId !== "none" ? state.selectedTeamId : undefined,
      secondaryEmail: needsCompanyEmail ? state.secondaryEmail.trim().toLowerCase() : undefined,
      secondaryVerificationCode: needsCompanyEmail ? state.secondaryVerificationCode : undefined,
      referredBy: readReferral(),
    });
    setBusy(false);
    if (!response.success) {
      if (response.codeExpired) {
        update("verificationCode", "");
        go("code", -1);
        setError("Code abgelaufen. Ein neuer Code wurde an deine E-Mail gesendet.");
        toast.info("Code abgelaufen – ein neuer Code wurde gesendet. Bitte prüfe deine E-Mail.");
        return;
      }
      const message = response.error || response.message || t("register.registrationError");
      setError(message);
      toast.error(message);
      return;
    }
    clearSavedRegistration();
    const created = Boolean(response.data?.token && response.data.user) && !response.data?.requiresApproval;
    toast.success(response.data?.requiresApproval ? t("register.registrationSuccess") : t("register.accountCreated"));
    onFinished(response.data?.requiresApproval ? "approval" : created ? "created" : "login", email, form.password);
  }

  return { form, teams, isVodafoneTeam, steps, passwordCheck, busy, error, direction, back, submit: () => actions[state.step]() };
}

/** Empfehlungscode aus v1 (?ref=…), der im Tab gemerkt wird. */
function readReferral(): string | undefined {
  try {
    return window.sessionStorage.getItem("referredBy") ?? undefined;
  } catch {
    return undefined;
  }
}
