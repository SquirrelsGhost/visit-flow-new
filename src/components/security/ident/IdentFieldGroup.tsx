import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IdentFieldGroupProps {
  label: string;
  className?: string;
  children: ReactNode;
}

/** Gruppe zusammengehöriger Felder mit kleiner Überschrift (Person, Dokument, Anschrift). */
export default function IdentFieldGroup({ label, className, children }: IdentFieldGroupProps) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--glass-label)]">{label}</legend>
      {children}
    </fieldset>
  );
}
