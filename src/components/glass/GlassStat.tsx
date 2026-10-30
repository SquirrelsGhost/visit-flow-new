import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface GlassStatProps {
  label: string;
  /** Die Zahl, meist eine GlassNumber. */
  children: ReactNode;
  /** "hero": riesige Zahl als Blickfang, "tile": kleine Kennzahl daneben. */
  size?: "hero" | "tile";
  /** Auf einer tiefen, dunklen Karte. */
  onDeep?: boolean;
  className?: string;
}

const NUMBER = {
  hero: "text-[44px] font-semibold leading-none tracking-[-0.035em] min-[400px]:text-[50px]",
  tile: "text-[22px] font-semibold leading-none tracking-[-0.02em]",
} as const;

/** Kennzahl: Beschriftung klein darüber, Zahl groß darunter. */
export default function GlassStat({ label, children, size = "tile", onDeep = false, className }: GlassStatProps) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <span className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", onDeep ? "text-white/55" : "text-[var(--glass-label)]")}>{label}</span>
      <span className={cn("mt-2 max-w-full truncate", NUMBER[size], onDeep ? (size === "hero" ? "glass-text-shine" : "text-white") : "text-foreground")}>{children}</span>
    </div>
  );
}
