import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

interface CardHeaderProps extends ComponentProps<"div"> {
  className?: string;
}

export default function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}
