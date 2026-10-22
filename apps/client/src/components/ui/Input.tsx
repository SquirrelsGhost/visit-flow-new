import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

/** Eingabefeld aus v1. 16px Schrift verhindert das Zoomen unter iOS. */
export default function Input({ className, type, style, onFocus, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[48px] touch-feedback",
        className,
      )}
      style={{ fontSize: "16px", ...style }}
      onFocus={(event) => {
        if (type === "number") event.target.select();
        onFocus?.(event);
      }}
      {...props}
    />
  );
}
