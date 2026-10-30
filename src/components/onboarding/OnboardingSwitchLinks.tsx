import { onboardingTexts as T } from "../../texts/onboardingTexts";

interface OnboardingSwitchLinksProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LINK =
  "relative font-semibold text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100";

/** Wege zu den anderen Reitern (v1: onSwitchToLogin / onSwitchToAdvisorRegister). */
export default function OnboardingSwitchLinks({ onLogin, onRegister }: OnboardingSwitchLinksProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-200/70 pt-4 text-xs text-muted-foreground dark:border-white/10">
      <span>
        {T.haveAccount}{" "}
        <button type="button" onClick={onLogin} className={LINK}>
          {T.toLogin}
        </button>
      </span>
      <button type="button" onClick={onRegister} className={LINK}>
        {T.joinAsAdvisor}
      </button>
    </div>
  );
}
