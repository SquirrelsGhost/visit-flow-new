import type { TranslationKey } from "../../texts/i18n/de";

export type RegisterStep = "data" | "team" | "code" | "companyEmail" | "companyCode" | "password";

export interface StepDef {
  id: RegisterStep;
  label: TranslationKey;
}

const SHORT: StepDef[] = [
  { id: "data", label: "register.step.data" },
  { id: "team", label: "register.step.team" },
  { id: "code", label: "register.step.code" },
  { id: "password", label: "register.step.password" },
];

const WITH_COMPANY_EMAIL: StepDef[] = [
  { id: "data", label: "register.step.data" },
  { id: "team", label: "register.step.team" },
  { id: "code", label: "register.step.code1" },
  { id: "companyEmail", label: "register.step.email2" },
  { id: "companyCode", label: "register.step.code2" },
  { id: "password", label: "register.step.password" },
];

/**
 * Schritte wie v1: vier im Normalfall, sechs, wenn ein Vodafone-Team eine Firmenadresse braucht.
 * Auf dem ersten Schritt bleiben es immer vier, damit beim Tippen nichts umspringt.
 */
export function stepsFor(current: RegisterStep, needsCompanyEmail: boolean): StepDef[] {
  return current !== "data" && needsCompanyEmail ? WITH_COMPANY_EMAIL : SHORT;
}

export function stepIndex(steps: StepDef[], step: RegisterStep): number {
  return Math.max(0, steps.findIndex((candidate) => candidate.id === step));
}
