import { CircleAlert, CircleCheck, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { GLASS_FIELD } from "@/components/glass/glassStyles";
import { cn } from "@/lib/cn";

interface IdentFieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  type?: "text" | "date";
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  /** Fehlertext, sobald das Feld berührt wurde; null = gültig. */
  error: string | null;
  showStatus: boolean;
  mono?: boolean;
}

/** Eingabefeld mit Symbol, Häkchen bei gültigem Wert und weich einblendender Fehlermeldung darunter. */
export default function IdentField({ id, label, icon: Icon, value, onChange, onBlur, type = "text", placeholder, autoComplete, hint, error, showStatus, mono }: IdentFieldProps) {
  const invalid = showStatus && error !== null;
  const valid = showStatus && error === null;
  const messageId = `${id}-message`;
  return (
    <div>
      <label htmlFor={id} className="block pb-1.5 pl-1 text-[13px] font-medium text-foreground/85">
        {label}
      </label>
      <div className="relative">
        <Icon aria-hidden className={cn("pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors duration-300", invalid ? "text-red-500" : valid ? "text-emerald-500" : "text-slate-400 dark:text-white/35")} />
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby={invalid || hint ? messageId : undefined}
          className={cn(
            GLASS_FIELD,
            "pl-11 pr-11 dark:[color-scheme:dark]",
            mono && "font-mono uppercase tracking-[0.08em] placeholder:normal-case placeholder:tracking-normal",
            invalid && "border-red-500/55 focus:border-red-500/70 focus:ring-red-500/15",
            valid && "border-emerald-500/40",
          )}
        />
        <AnimatePresence initial={false}>
          {(valid || invalid) && (
            <motion.span key={valid ? "ok" : "bad"} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              {valid ? <CircleCheck className="h-[18px] w-[18px] text-emerald-500" /> : <CircleAlert className="h-[18px] w-[18px] text-red-500" />}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false} mode="wait">
        {(invalid || hint) && (
          <motion.p key={invalid ? "error" : "hint"} id={messageId} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className={cn("pl-1 pt-1.5 text-[12px] leading-snug", invalid ? "font-medium text-red-600 dark:text-red-400" : "text-[var(--glass-label)]")}>
            {invalid ? error : hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
