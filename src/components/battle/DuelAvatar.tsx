import { Crown } from "lucide-react";
import type { DuelSide } from "../../lib/battle/duel";
import { cn } from "../../lib/cn";
import { SIDE_AVATAR, initial } from "./battleStyles";

interface DuelAvatarProps {
  name: string;
  side: DuelSide;
  leads: boolean;
  size?: "md" | "lg";
}

const SIZES = { md: "h-11 w-11 text-[15px]", lg: "h-16 w-16 text-[22px]" } as const;

/** Rundes Bild einer Duellseite in Teamfarbe; wer führt, trägt die Krone und einen goldenen Ring. */
export default function DuelAvatar({ name, side, leads, size = "md" }: DuelAvatarProps) {
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "flex items-center justify-center rounded-full font-semibold text-white ring-1 ring-white/25 transition-[box-shadow] duration-500",
          SIZES[size],
          SIDE_AVATAR[side],
          leads && "ring-2 ring-amber-300/90",
        )}
      >
        {initial(name)}
      </span>
      {leads && (
        <Crown
          aria-hidden
          className="absolute -top-2.5 left-1/2 h-4 w-4 -translate-x-1/2 -rotate-6 fill-amber-300 text-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.6)]"
        />
      )}
    </span>
  );
}
