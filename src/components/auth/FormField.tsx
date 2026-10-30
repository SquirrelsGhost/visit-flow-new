import { CheckCircle } from "lucide-react";
import { useState, type ReactNode, type Ref } from "react";
import { cn } from "../../lib/cn";
import { hapticFeedback } from "../../lib/device/haptics";
import Input from "../ui/Input";
import Label from "../ui/Label";
import FieldMessage from "./FieldMessage";
import PasswordToggle from "./PasswordToggle";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "date";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  /** Fehlermeldung des Feldes; null oder leer heißt kein Fehler. */
  error?: string | null;
  isValid?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  "data-testid"?: string;
  enableHapticFeedback?: boolean;
  showCharacterCount?: boolean;
  helpText?: string;
  ref?: Ref<HTMLInputElement>;
}

/** Großes Formularfeld der Anmeldeseiten, Aussehen aus v1 mit weicherem Fokus-Leuchten. */
export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  isValid,
  required = false,
  disabled = false,
  className,
  icon,
  showPasswordToggle = false,
  autoComplete,
  autoFocus,
  maxLength,
  "data-testid": testId,
  enableHapticFeedback = true,
  showCharacterCount,
  helpText,
  ref,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);
  const showValidIcon = isValid && value.length > 0 && !hasError;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium tracking-tight transition-colors duration-200",
          hasError ? "text-red-600 dark:text-red-500" : "text-slate-700 dark:text-neutral-200",
          required && "after:content-['*'] after:ml-0.5 after:text-red-500 dark:after:text-red-400",
        )}
      >
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <div
              className={cn(
                "transition-colors duration-300",
                hasError || isFocused ? "text-red-500" : "text-slate-400",
              )}
            >
              {icon}
            </div>
          </div>
        )}
        <Input
          ref={ref}
          id={id}
          name={id}
          type={type === "password" && showPassword ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (enableHapticFeedback) hapticFeedback("light");
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          aria-invalid={hasError || undefined}
          data-testid={testId}
          className={cn(
            "h-[52px] bg-slate-50/70 dark:bg-white/[0.03] border rounded-xl shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-300",
            "text-foreground placeholder:text-muted-foreground",
            "focus-visible:ring-4 focus-visible:ring-red-500/[0.08] dark:focus-visible:ring-red-500/20 focus-visible:ring-offset-0 focus-visible:outline-none focus:bg-card hover:border-slate-300 dark:hover:border-neutral-700",
            icon ? "pl-11" : "pl-4",
            showPasswordToggle || showValidIcon ? "pr-12" : "pr-4",
            hasError
              ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400"
              : showValidIcon
                ? "border-green-500 dark:border-green-500 focus:border-green-500 dark:focus:border-green-400"
                : "border-slate-200 dark:border-neutral-800 focus:border-red-400 dark:focus:border-red-500/70",
            disabled && "opacity-50 cursor-not-allowed",
            "min-h-[44px] touch-manipulation",
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {showValidIcon && <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />}
          {showPasswordToggle && type === "password" && (
            <PasswordToggle
              visible={showPassword}
              disabled={disabled}
              testId={testId}
              onToggle={() => {
                setShowPassword((current) => !current);
                if (enableHapticFeedback) hapticFeedback("medium");
              }}
            />
          )}
        </div>
      </div>
      <FieldMessage {...{ error, helpText, value, maxLength, showCharacterCount }} />
    </div>
  );
}
