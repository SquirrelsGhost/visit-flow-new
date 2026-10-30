import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { riseIn } from "../../lib/motion/presets";
import { cn } from "../../lib/cn";

interface UserMenuItemProps {
  icon: LucideIcon;
  label: string;
  /** Farben des Symbol-Kästchens wie in v1, z. B. "bg-blue-100 text-blue-600". */
  tone: string;
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
}

const ROW =
  "group flex w-full items-center gap-3 rounded-lg text-left px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none";
const ICON_BOX =
  "rounded-lg p-1.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none";

/** Eine Zeile im Benutzermenü. Link oder Aktion; das Symbol rückt beim Überfahren ein Stück nach rechts. */
export default function UserMenuItem({ icon: Icon, label, tone, href, onSelect, danger = false }: UserMenuItemProps) {
  const className = cn(
    ROW,
    danger
      ? "text-red-600 hover:bg-red-50 focus-visible:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
      : "text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  );
  const content = (
    <>
      <span className={cn(ICON_BOX, tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
    </>
  );
  return (
    <motion.li variants={riseIn} role="none">
      {href ? (
        <Link href={href} role="menuitem" className={className} onClick={onSelect}>
          {content}
        </Link>
      ) : (
        <button type="button" role="menuitem" className={className} onClick={onSelect}>
          {content}
        </button>
      )}
    </motion.li>
  );
}
