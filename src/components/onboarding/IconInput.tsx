import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { FIELD } from "./onboardingClasses";

interface IconInputProps {
  id: string;
  Icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  /** Große Variante für den Teamnamen, sonst kompakt. */
  large?: boolean;
  /** Eigener Name fürs Vorlesen, wenn keine sichtbare Beschriftung auf das Feld zeigt. */
  label?: string;
}

/** Eingabefeld mit Symbol, wie die Felder im v1-Team-Buchen. 16px Schrift verhindert das Zoomen unter iOS. */
export default function IconInput({
  id,
  Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  large = false,
  label,
}: IconInputProps) {
  return (
    <div className="group relative">
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-red-500",
          large ? "left-4 h-5 w-5" : "left-3.5 h-[18px] w-[18px]",
        )}
      />
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onInput={(event) => onChange((event.target as HTMLInputElement).value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={label}
        className={cn(FIELD, large ? "h-[52px] pl-12 pr-4 text-base font-semibold" : "h-12 pl-10 pr-3 text-base font-medium sm:text-sm")}
      />
    </div>
  );
}
