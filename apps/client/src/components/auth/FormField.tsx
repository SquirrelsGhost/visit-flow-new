import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode, type Ref } from "react";
import { cn } from "../../lib/cn";
import { hapticFeedback } from "../../lib/device/haptics";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import FieldMessage from "./FieldMessage";

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

/** Großes Formularfeld der Anmeldeseiten, Aussehen 1:1 aus v1. */
export default function FormField({
  id, label, type = "text", value, onChange, onBlur, onFocus, placeholder, error, isValid, required = false,
  disabled = false, className, icon, showPasswordToggle = false, autoComplete, autoFocus, maxLength,
  "data-testid": testId, enableHapticFeedback = true, showCharacterCount, helpText, ref,
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
            <div className={cn("transition-colors duration-200", hasError || isFocused ? "text-red-500 dark:text-red-400" : "text-muted-foreground")}>
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
            "h-16 text-lg bg-background border-2 rounded-xl transition-all duration-200",
            "text-foreground placeholder:text-muted-foreground",
            "focus-visible:ring-2 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/30 focus-visible:outline-none",
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-transparent dark:hover:bg-transparent"
              onClick={() => {
                setShowPassword((current) => !current);
                if (enableHapticFeedback) hapticFeedback("medium");
              }}
              disabled={disabled}
              tabIndex={-1}
              data-testid={`${testId}-password-toggle`}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </Button>
          )}
        </div>
      </div>
      <FieldMessage error={error} helpText={helpText} value={value} maxLength={maxLength} showCharacterCount={showCharacterCount} />
    </div>
  );
}
