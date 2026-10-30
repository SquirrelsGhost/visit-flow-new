import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { FIELD } from "./settingsStyles";

interface SettingsFieldProps extends ComponentProps<"input"> {
  label: string;
}

/** Eingabefeld in aufgeklappten Zeilen; die Beschriftung steht als Platzhalter und für Screenreader. */
export default function SettingsField({ label, className, ...props }: SettingsFieldProps) {
  return <input aria-label={label} placeholder={label} className={cn(FIELD, className)} {...props} />;
}
