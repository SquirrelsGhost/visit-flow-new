import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { CODE_LENGTH, cleanCode } from "../../lib/register/registerValidation";
import Label from "../ui/Label";

interface CodeInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const SLOTS = Array.from({ length: CODE_LENGTH }, (_, index) => index);

/**
 * Sechsstelliger Code als einzelne Kästchen. Darunter liegt ein echtes Eingabefeld,
 * damit Einfügen, Autofill ("one-time-code") und Screenreader normal funktionieren.
 */
export default function CodeInput({ id, label, value, onChange }: CodeInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium tracking-tight text-slate-700 after:ml-0.5 after:text-red-500 after:content-['*'] dark:text-neutral-200">
        {label}
      </Label>
      <div className="relative">
        <input
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(cleanCode(event.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          autoFocus
          required
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
          style={{ fontSize: "16px" }}
        />
        <div aria-hidden="true" className="grid grid-cols-6 gap-2">
          {SLOTS.map((slot) => {
            const digit = value[slot] ?? "";
            const active = focused && slot === Math.min(value.length, CODE_LENGTH - 1);
            return (
              <div
                key={slot}
                className={cn(
                  "relative flex h-14 items-center justify-center rounded-xl border bg-slate-50/70 text-2xl font-bold tabular-nums text-foreground transition-[border-color,box-shadow,background-color] duration-300 dark:bg-white/[0.03]",
                  active
                    ? "border-red-400 bg-card shadow-[0_0_0_4px_rgba(239,68,68,0.08)] dark:border-red-500/70"
                    : digit
                      ? "border-slate-300 dark:border-neutral-700"
                      : "border-slate-200 dark:border-neutral-800",
                )}
              >
                {digit && (
                  <motion.span key={digit + slot} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SNAPPY_SPRING}>
                    {digit}
                  </motion.span>
                )}
                {active && !digit && <span className="h-6 w-px animate-pulse bg-red-500 motion-reduce:animate-none" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
