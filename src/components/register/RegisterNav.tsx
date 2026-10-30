import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";
import BusyLabel from "../onboarding/BusyLabel";
import { PRIMARY, SECONDARY } from "../onboarding/onboardingClasses";

interface RegisterNavProps {
  label: string;
  busyLabel: string;
  busy: boolean;
  disabled: boolean;
  showArrow: boolean;
  backLabel: string;
  onBack?: () => void;
}

/** Zurück und Weiter eines Registrierungsschritts. Auf dem ersten Schritt gibt es nur Weiter. */
export default function RegisterNav({ label, busyLabel, busy, disabled, showArrow, backLabel, onBack }: RegisterNavProps) {
  return (
    <div className="flex gap-3 pt-1">
      {onBack && (
        <button type="button" onClick={onBack} disabled={busy} className={cn(SECONDARY, "h-12 flex-1 rounded-xl text-[15px] font-semibold")}>
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          {backLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={disabled || busy}
        className={cn(PRIMARY, "h-12 flex-1 rounded-xl text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50", busy && "disabled:cursor-wait disabled:opacity-80")}
        data-testid="register-submit"
      >
        {busy ? (
          <BusyLabel label={busyLabel.replace(/\.+$/, "")} />
        ) : (
          <>
            {label}
            {showArrow && <ArrowRight className="h-5 w-5" strokeWidth={2} />}
          </>
        )}
      </button>
    </div>
  );
}
