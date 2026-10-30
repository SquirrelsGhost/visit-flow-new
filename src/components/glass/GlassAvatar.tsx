import { cn } from "../../lib/cn";

interface GlassAvatarProps {
  initial: string;
  size?: "md" | "xl";
  className?: string;
}

const SIZES = { md: "h-14 w-14 text-[22px]", xl: "h-[100px] w-[100px] text-[40px]" } as const;

/** Avatar auf tiefen Karten: roter Verlauf, Lichtkante oben und ein weicher Schein darunter. */
export default function GlassAvatar({ initial, size = "md", className }: GlassAvatarProps) {
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center", SIZES[size], className)}>
      <span aria-hidden className="animate-glass-breathe absolute -inset-4 rounded-full bg-[radial-gradient(closest-side,rgba(239,68,68,0.55),transparent)]" />
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-red-500 to-red-700 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-8px_16px_rgba(127,29,29,0.35)] ring-1 ring-white/25">
        {initial}
      </span>
    </span>
  );
}
