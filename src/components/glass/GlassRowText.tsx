import { cn } from "../../lib/cn";
import { GLASS_SUBTITLE, GLASS_TITLE } from "./glassStyles";

interface GlassRowTextProps {
  title: string;
  subtitle?: string;
  /** Unterzeile als Warnung (z. B. "im Browser blockiert"). */
  warn?: boolean;
}

/** Titel und Unterzeile einer Glas-Zeile. */
export default function GlassRowText({ title, subtitle, warn = false }: GlassRowTextProps) {
  return (
    <span className="min-w-0 flex-1">
      <span className={GLASS_TITLE}>{title}</span>
      {subtitle && <span className={cn(GLASS_SUBTITLE, warn && "text-red-600 dark:text-red-400")}>{subtitle}</span>}
    </span>
  );
}
