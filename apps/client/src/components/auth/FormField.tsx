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
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "text-base font-semibold transition-colors duration-200",
          hasError ? "text-red-600 dark:text-red-500" : "text-foreground",
          required && "after:content-['*'] after:ml-1 after:text-red-500 dark:after:text-red-400",
        )}
      >
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
            <div
              className={cn(
                "transition-all duration-300",
                hasError || isFocused ? "text-red-500 dark:text-red-400" : "text-muted-foreground",
                isFocused && "scale-110",
              )}
            >
              {icon}
            </div>
          </div>
        )}
        <Input
          ref={ref}
          id={id}
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
            "h-16 text-lg bg-background border-2 rounded-xl transition-[border-color,box-shadow,background-color] duration-300",
            "text-foreground placeholder:text-muted-foreground",
            "focus-visible:ring-4 focus-visible:ring-red-500/10 dark:focus-visible:ring-red-500/20 focus-visible:ring-offset-0 focus-visible:outline-none focus:bg-card hover:border-red-200 dark:hover:border-red-900/60",
            icon ? "pl-14" : "pl-6",
            showPasswordToggle || showValidIcon ? "pr-14" : "pr-6",
            hasError
              ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400"
              : showValidIcon
                ? "border-green-500 dark:border-green-500 focus:border-green-500 dark:focus:border-green-400"
                : "border-border focus:border-red-500 dark:focus:border-red-400",
            disabled && "opacity-50 cursor-not-allowed",
            "min-h-[44px] touch-manipulation",
          )}
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center space-x-2">
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
