import { cn } from "../../lib/cn";
import Button from "../ui/Button";

interface LoginSubmitButtonProps {
  busy: boolean;
  disabled: boolean;
  label: string;
  busyLabel: string;
}

const BUTTON_CLASSES = cn(
  "w-full h-12 text-[15px] font-semibold tracking-tight rounded-xl transition-all duration-200",
  "bg-gradient-to-b from-red-500 to-red-600 ring-1 ring-inset ring-white/15",
  "shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_24px_-10px_rgba(220,38,38,0.7)] dark:shadow-black/40",
  "hover:from-red-600 hover:to-red-700",
  "hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_14px_28px_-10px_rgba(220,38,38,0.75)] active:translate-y-0 active:scale-[0.98] touch-manipulation button-sheen",
  "disabled:opacity-80 disabled:cursor-wait disabled:hover:translate-y-0",
  "text-white min-h-[44px]",
);

/** Roter Anmelde-Button aus v1 mit Lade-Kreis und hüpfenden Punkten. Statt grobem Vergrößern hebt er sich leicht an, ein Glanz läuft durch. */
export default function LoginSubmitButton({ busy, disabled, label, busyLabel }: LoginSubmitButtonProps) {
  return (
    <Button type="submit" className={BUTTON_CLASSES} disabled={disabled} data-testid="login-submit">
      {busy ? (
        <div className="flex items-center justify-center">
          <div className="relative w-5 h-5 mr-3">
            <div className="absolute inset-0 border-2 border-white/30 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin" />
          </div>
          <span className="font-semibold">{busyLabel}</span>
          <span className="ml-1 flex gap-0.5">
            {["0s", "0.1s", "0.2s"].map((delay) => (
              <span key={delay} className="animate-bounce" style={{ animationDelay: delay }}>
                .
              </span>
            ))}
          </span>
        </div>
      ) : (
        <span className="font-semibold">{label}</span>
      )}
    </Button>
  );
}
