import { useState } from "react";
import { toast } from "sonner";
import { assignedEmails, clampLicenses, LICENSES, resizeSlots } from "../lib/onboarding/licenses";
import { onboardTeam, type CheckoutMode, type CreatedTeam } from "../lib/onboarding/onboardingApi";
import { onboardingTexts as T } from "../texts/onboardingTexts";

const MIN_PASSWORD = 6;
/** Plan der Einzel-Lizenzen, abgerechnet pro Lizenz und Monat. */
const PLAN_ID = "team-licenses";

/** Prüft die Pflichtangaben in der Reihenfolge von v1 und liefert die erste Meldung. */
function firstProblem(teamName: string, name: string, email: string, password: string): string | null {
  if (!teamName.trim()) return T.errorTeamName;
  if (!name.trim() || !email.trim() || !email.includes("@")) return T.errorContact;
  if (password.length < MIN_PASSWORD) return T.errorPassword;
  return null;
}

/** Zustand und Absenden des Team-Buchens: Team, Einzel-Lizenzen und Teamleiter-Zugang. */
export function useTeamOnboarding() {
  const [teamName, setTeamName] = useState("");
  const [licenses, setLicensesState] = useState<number>(LICENSES.initial);
  const [slots, setSlots] = useState<string[]>(() => resizeSlots([], LICENSES.initial));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<CheckoutMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdTeam, setCreatedTeam] = useState<CreatedTeam | null>(null);

  function setLicenses(value: number) {
    const next = clampLicenses(value);
    setLicensesState(next);
    setSlots((current) => resizeSlots(current, next));
  }

  function setSlot(index: number, value: string) {
    setSlots((current) => current.map((slot, position) => (position === index ? value : slot)));
  }

  async function submit(checkoutMode: CheckoutMode) {
    const domVal = (id: string) =>
      typeof document !== "undefined" ? (document.getElementById(id) as HTMLInputElement | null)?.value ?? "" : "";
    const resolvedTeamName = teamName || domVal("team-name");
    const resolvedName = name || domVal("leader-name");
    const resolvedEmail = email || domVal("leader-email");
    const resolvedPassword = password || domVal("leader-password");

    if (resolvedTeamName !== teamName) setTeamName(resolvedTeamName);
    if (resolvedName !== name) setName(resolvedName);
    if (resolvedEmail !== email) setEmail(resolvedEmail);
    if (resolvedPassword !== password) setPassword(resolvedPassword);

    const problem = firstProblem(resolvedTeamName, resolvedName, resolvedEmail, resolvedPassword);
    setError(problem);
    if (problem) return;
    setBusy(checkoutMode);
    const response = await onboardTeam({
      teamName: resolvedTeamName.trim(),
      licenseCount: licenses,
      advisorCount: licenses,
      advisorEmails: assignedEmails(slots),
      planId: PLAN_ID,
      checkoutMode,
      name: resolvedName.trim(),
      email: resolvedEmail.trim().toLowerCase(),
      password: resolvedPassword,
    });
    setBusy(null);
    if (!response.success) {
      const message = response.error || response.message || T.errorFailed;
      setError(message);
      toast.error(message);
      return;
    }
    const { team, stripeCheckoutUrl } = response.data;
    toast.success(T.built(team.name));
    if (checkoutMode === "stripe" && stripeCheckoutUrl) {
      window.location.assign(stripeCheckoutUrl);
      return;
    }
    setCreatedTeam(team);
  }

  function updateTeamName(val: string) {
    setTeamName(val);
    if (error) setError(null);
  }

  function updateName(val: string) {
    setName(val);
    if (error) setError(null);
  }

  function updateEmail(val: string) {
    setEmail(val);
    if (error) setError(null);
  }

  function updatePassword(val: string) {
    setPassword(val);
    if (error) setError(null);
  }

  return {
    form: { teamName, licenses, slots, name, email, password },
    set: { setTeamName: updateTeamName, setLicenses, setSlot, setName: updateName, setEmail: updateEmail, setPassword: updatePassword },
    assigned: assignedEmails(slots).length,
    busy,
    error,
    createdTeam,
    submit,
  };
}
