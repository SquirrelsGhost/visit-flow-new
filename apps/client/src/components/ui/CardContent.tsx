import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export default function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
