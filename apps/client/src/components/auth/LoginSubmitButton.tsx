import { cn } from "../../lib/cn";
import Button from "../ui/Button";

interface LoginSubmitButtonProps {
  busy: boolean;
  disabled: boolean;
  label: string;
  busyLabel: string;
}

const BUTTON_CLASSES = cn(
  "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg dark:shadow-black/30",
  "bg-gradient-to-r from-red-600 to-red-700 dark:from-red-600 dark:to-red-700",
  "hover:from-red-700 hover:to-red-800 dark:hover:from-red-700 dark:hover:to-red-800",
  "hover:scale-105 hover:shadow-xl dark:hover:shadow-black/50 touch-manipulation",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  "text-white min-h-[44px]",
);

/** Roter Anmelde-Button mit Lade-Kreis und hüpfenden Punkten (v1 LoginForm). */
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
