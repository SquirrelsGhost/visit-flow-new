import { ArrowRight, CreditCard, ShieldCheck } from "lucide-react";
import { Fragment } from "react";
import { cn } from "../../lib/cn";
import type { CheckoutMode } from "../../lib/onboarding/onboardingApi";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import BusyLabel from "./BusyLabel";
import { PRIMARY, SECONDARY } from "./onboardingClasses";

interface OnboardingActionsProps {
  busy: CheckoutMode | null;
  onSubmit: (mode: CheckoutMode) => void;
}

/** Buchen-Buttons (sofort oder über Stripe) und die drei Versprechen darunter. */
export default function OnboardingActions({ busy, onSubmit }: OnboardingActionsProps) {
  return (
    <div className="space-y-3 pt-1">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => onSubmit("instant")}
          className={cn(PRIMARY, "h-14 flex-1 px-4 text-sm sm:text-[15px]")}
          data-testid="onboarding-submit"
        >
          {busy === "instant" ? (
            <BusyLabel label={T.submitting} />
          ) : (
            <>
              {T.submit}
              <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={2} />
            </>
          )}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => onSubmit("stripe")}
          className={cn(SECONDARY, "h-14 px-5 text-xs")}
        >
          <CreditCard className="h-4 w-4 text-red-500" strokeWidth={2} />
          {T.stripe}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {T.trust.map((item, index) => (
          <Fragment key={item}>
            {index > 0 && <span aria-hidden="true">•</span>}
            <span className="inline-flex items-center gap-1">
              {index === 0 && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />}
              {item}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
