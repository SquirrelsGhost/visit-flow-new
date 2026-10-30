import { AnimatePresence, motion, type Variants } from "motion/react";
import type { FormEvent } from "react";
import { useRegisterFlow, type RegisterOutcome } from "../../hooks/useRegisterFlow";
import { useTranslation } from "../../hooks/useTranslation";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { canProceed } from "../../lib/register/canProceed";
import { stepIndex, type RegisterStep } from "../../lib/register/registerSteps";
import type { TranslationKey } from "../../texts/i18n/de";
import LoginErrorBox from "../auth/LoginErrorBox";
import RegisterNav from "./RegisterNav";
import RegisterStepContent from "./RegisterStepContent";
import RegisterStepper from "./RegisterStepper";

interface RegisterWizardProps {
  onFinished: (outcome: RegisterOutcome, email: string, password: string) => void;
}

/** Beschriftung des Weiter-Buttons je Schritt (v1). */
const BUTTONS: Record<RegisterStep, { label: TranslationKey; busy: TranslationKey; arrow: boolean }> = {
  data: { label: "register.next", busy: "register.next", arrow: true },
  team: { label: "register.sendCode", busy: "register.sendingCode", arrow: true },
  code: { label: "register.verify", busy: "register.verifying", arrow: false },
  companyEmail: { label: "register.sendCode", busy: "register.sendingCode", arrow: true },
  companyCode: { label: "register.verify", busy: "register.verifying", arrow: false },
  password: { label: "register.createAccount", busy: "register.creatingAccount", arrow: false },
};

/** Schritte gleiten in Leserichtung herein: vorwärts von rechts, zurück von links. */
const SLIDE: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 28, filter: "blur(4px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: SOFT_SPRING },
  exit: (dir: number) => ({ opacity: 0, x: dir * -28, filter: "blur(4px)", transition: { duration: 0.18 } }),
};

/** Reiter "Berater-Beitritt": Registrierung in Schritten wie v1 (RegisterForm3Step). */
export default function RegisterWizard({ onFinished }: RegisterWizardProps) {
  const { t } = useTranslation();
  const flow = useRegisterFlow(onFinished);
  const { state, password, confirmPassword } = flow.form;
  const current = stepIndex(flow.steps, state.step);
  const button = BUTTONS[state.step];
  const ready = canProceed(state.step, { ...state, password, confirmPassword, passwordCheck: flow.passwordCheck });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ready && !flow.busy) flow.submit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <RegisterStepper steps={flow.steps} current={current} />
      <AnimatePresence initial={false}>{flow.error && <LoginErrorBox key="error" message={flow.error} />}</AnimatePresence>
      <AnimatePresence mode="wait" initial={false} custom={flow.direction}>
        <motion.div key={state.step} custom={flow.direction} variants={SLIDE} initial="enter" animate="center" exit="exit">
          <RegisterStepContent flow={flow} />
        </motion.div>
      </AnimatePresence>
      <RegisterNav
        label={t(button.label)}
        busyLabel={t(button.busy)}
        busy={flow.busy}
        disabled={!ready}
        showArrow={button.arrow}
        backLabel={t("register.back")}
        onBack={current > 0 ? flow.back : undefined}
      />
    </form>
  );
}
