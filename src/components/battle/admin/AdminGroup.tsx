import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { GROUP_LABEL } from "../battleStyles";

interface AdminGroupProps {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/** Eine Gruppe der Verwaltung: kleine Überschrift in Versalien, darunter der Inhalt (wie Einstellungen in iOS). */
export default function AdminGroup({ label, hint, className, children }: AdminGroupProps) {
  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="px-1">
        <h4 className={GROUP_LABEL}>{label}</h4>
        {hint && <p className="mt-1 text-[12px] leading-snug text-slate-500 dark:text-neutral-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
