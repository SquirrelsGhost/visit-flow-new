import { cn } from "../../lib/cn";

interface UserAvatarProps {
  name: string;
  size?: "md" | "lg";
}

const SIZES = { md: "h-9 w-9 text-[12px]", lg: "h-10 w-10 text-[13px]" } as const;

/** Roter Kreis mit dem ersten Buchstaben des Namens, wie in v1. */
export default function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 font-bold leading-none text-white shadow-md",
        SIZES[size],
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
