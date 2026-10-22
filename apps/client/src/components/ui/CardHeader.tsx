import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export default function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}
