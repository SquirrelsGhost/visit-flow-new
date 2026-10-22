import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export default function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />;
}
