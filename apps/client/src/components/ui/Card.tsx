import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

/** Karte wie im v1-Design-System (Variante "default", ohne Innenabstand). */
export default function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-lg border bg-card text-card-foreground border-border shadow-sm transition-all duration-250", className)}
      {...props}
    />
  );
}
