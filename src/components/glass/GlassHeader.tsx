import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface GlassHeaderProps {
  /** Bild links bzw. oben (Avatar, Symbol). */
  leading?: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  /** Zentriert (Profilkopf) oder linksbündig neben dem Bild (kompakte Kopfkarte). */
  align?: "center" | "start";
  /** Plaketten unter dem Text. */
  children?: ReactNode;
}

/** Kopf einer tiefen Karte: Bild, kleine Vorzeile, großer Titel, Unterzeile und Plaketten. */
export default function GlassHeader({ leading, eyebrow, title, subtitle, align = "center", children }: GlassHeaderProps) {
  const center = align === "center";
  return (
    <div className={cn("relative flex", center ? "flex-col items-center text-center" : "items-center gap-4 text-left")}>
      {leading}
      <div className={cn("min-w-0", center ? "mt-4 max-w-full" : "flex-1")}>
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{eyebrow}</p>}
        <h2 className={cn("truncate font-semibold leading-tight tracking-[-0.025em] text-white", center ? "text-[28px]" : "text-[19px]")}>{title}</h2>
        {subtitle && <div className={cn("text-white/60", center ? "mt-1 text-[14px]" : "mt-0.5 truncate text-[13px]")}>{subtitle}</div>}
        {children && <div className={cn("flex flex-wrap gap-1.5", center ? "mt-4 justify-center" : "mt-2")}>{children}</div>}
      </div>
    </div>
  );
}
