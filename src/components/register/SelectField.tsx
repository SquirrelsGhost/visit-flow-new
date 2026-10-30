import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import Label from "../ui/Label";

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  required?: boolean;
  placeholder?: string;
  children: ReactNode;
}

const SELECT =
  "h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-10 text-base text-foreground shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-300 hover:border-slate-300 focus:border-red-400 focus:bg-card focus:outline-none focus:ring-4 focus:ring-red-500/[0.08] dark:border-neutral-800 dark:bg-white/[0.03] dark:hover:border-neutral-700 dark:focus:border-red-500/70 dark:focus:ring-red-500/20 touch-manipulation";

/** Auswahlfeld im Stil der Login-Felder. Bewusst nativ: Auf dem Handy öffnet sich die gewohnte Systemauswahl. */
export default function SelectField({ id, label, value, onChange, icon, required = false, placeholder, children }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium tracking-tight text-slate-700 dark:text-neutral-200",
          required && "after:ml-0.5 after:text-red-500 after:content-['*'] dark:after:text-red-400",
        )}
      >
        {label}
      </Label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-red-500">
          {icon}
        </span>
        <select
          id={id}
          name={id}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          className={cn(SELECT, value === "" && "text-muted-foreground")}
        >
          {placeholder !== undefined && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
      </div>
    </div>
  );
}
