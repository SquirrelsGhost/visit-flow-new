import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

interface CardContentProps extends ComponentProps<"div"> {
  className?: string;
}

export default function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
