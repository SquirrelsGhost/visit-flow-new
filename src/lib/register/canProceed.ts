import type { PasswordCheck } from "./passwordStrength";
import type { RegisterStep } from "./registerSteps";
import { CODE_LENGTH, isCompanyEmail, validateEmail, validateName } from "./registerValidation";

interface ProceedInput {
  name: string;
  email: string;
  contractStart: string;
  verificationCode: string;
  secondaryEmail: string;
  secondaryVerificationCode: string;
  password: string;
  confirmPassword: string;
  passwordCheck: PasswordCheck;
}

/** Wann der Weiter-Button eines Schritts aktiv ist (v1 canProceedStepN). */
export function canProceed(step: RegisterStep, input: ProceedInput): boolean {
  switch (step) {
    case "data":
      return !validateName(input.name) && !validateEmail(input.email);
    case "team":
      return input.contractStart !== "";
    case "code":
      return input.verificationCode.length === CODE_LENGTH;
    case "companyEmail":
      return !validateEmail(input.secondaryEmail) && isCompanyEmail(input.secondaryEmail);
    case "companyCode":
      return input.secondaryVerificationCode.length === CODE_LENGTH;
    case "password":
      return input.password.length > 0 && input.password === input.confirmPassword && input.passwordCheck.isValid;
  }
}
