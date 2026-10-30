import type { ComponentProps } from "react";
import { cn } from "../../../lib/cn";
import { CALC_INPUT } from "../calcGlass";

interface MoneyInputProps extends Omit<ComponentProps<"input">, "value" | "onChange"> {
  value: number | string;
  onValue: (value: string) => void;
}

/** Zahlenfeld für Euro-Beträge: Dezimaltastatur, markiert beim Antippen alles (v1 NumberInput). */
export default function MoneyInput({ value, onValue, className, ...props }: MoneyInputProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step="0.01"
      value={value}
      onChange={(e) => onValue(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      className={cn(
        CALC_INPUT,
        "tabular-nums",
        className,
      )}
      {...props}
    />
  );
}
