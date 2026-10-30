import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends ComponentProps<"div"> {
  className?: string;
}

/** Glaskarte (früher v1-Variante "default"), ohne Innenabstand. */
export default function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass-surface rounded-[22px] text-card-foreground transition-all duration-250",
        className,
      )}
      {...props}
    />
  );
}
