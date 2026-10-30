import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../../../lib/cn";
import { GLASS_BUTTON } from "../../glass/glassStyles";

interface SheetButtonProps {
  label: string;
  onClick?: () => void;
  /** "submit" schickt das umgebende Formular ab. */
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  icon?: LucideIcon;
  busy?: boolean;
  busyLabel?: string;
  disabled?: boolean;
}

const VARIANT = {
  primary: GLASS_BUTTON,
  secondary: "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900/[0.05] text-sm font-semibold text-foreground transition-[background-color,transform] duration-200 hover:bg-slate-900/[0.08] active:scale-[0.98] disabled:opacity-50 dark:bg-white/[0.07] dark:hover:bg-white/[0.11]",
  danger: "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 text-sm font-semibold text-red-600 transition-[background-color,transform] duration-200 hover:bg-red-500/15 active:scale-[0.98] disabled:opacity-50 dark:text-red-400",
} as const;

/** Knopf in einem Sheet: Hauptaktion rot leuchtend, Nebenaktion ruhig, Entziehen als leiser Warnknopf. */
export default function SheetButton({ label, onClick, type = "button", variant = "primary", icon: Icon, busy = false, busyLabel, disabled = false }: SheetButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={busy || disabled} aria-busy={busy} className={cn(VARIANT[variant])}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : Icon && <Icon className="h-4 w-4" />}
      {busy ? (busyLabel ?? label) : label}
    </button>
  );
}
