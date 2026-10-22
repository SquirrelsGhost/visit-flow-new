import { cn } from "../../lib/cn";

interface RememberMeToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

/** Eigene Checkbox "Angemeldet bleiben" aus v1, jetzt als echter, per Tastatur bedienbarer Schalter. */
export default function RememberMeToggle({ checked, onChange, label }: RememberMeToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center space-x-3 cursor-pointer group bg-transparent p-0 !min-h-0 !min-w-0"
      data-testid="login-remember-me"
    >
      <span
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200",
          checked
            ? "bg-red-600 dark:bg-red-600 border-red-600 dark:border-red-600"
            : "bg-transparent border-border dark:border-border group-hover:border-red-400 dark:group-hover:border-red-500",
        )}
      >
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="text-sm font-medium leading-none text-foreground cursor-pointer select-none">{label}</span>
    </button>
  );
}
