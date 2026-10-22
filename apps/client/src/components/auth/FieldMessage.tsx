import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";

interface FieldMessageProps {
  error?: string | null;
  helpText?: string;
  value: string;
  maxLength?: number;
  showCharacterCount?: boolean;
}

/** Fehlerzeile, Hilfetext und Zeichenzähler unter einem Formularfeld (v1 FormField). */
export default function FieldMessage({ error, helpText, value, maxLength, showCharacterCount }: FieldMessageProps) {
  const nearLimit = maxLength !== undefined && value.length >= Math.ceil(maxLength * 0.9);
  return (
    <>
      {error && (
        <div
          className="flex items-center space-x-2 text-red-600 dark:text-red-500 animate-fade-in"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
      {helpText && !error && <div className="text-sm text-muted-foreground">{helpText}</div>}
      {(maxLength || showCharacterCount) && (
        <div className="flex justify-end">
          <span
            className={cn(
              "text-xs transition-colors duration-200",
              maxLength && value.length === maxLength
                ? "text-red-500 dark:text-red-400 font-medium"
                : nearLimit
                  ? "text-orange-500 dark:text-orange-400 font-medium"
                  : "text-muted-foreground",
            )}
          >
            {value.length}
            {maxLength ? `/${maxLength}` : ""}
          </span>
        </div>
      )}
    </>
  );
}
