import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

interface CardTitleProps extends ComponentProps<"h3"> {
  className?: string;
}

export default function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />;
}
