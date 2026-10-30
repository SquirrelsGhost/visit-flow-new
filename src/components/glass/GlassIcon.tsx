import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { GLASS_TONES, type GlassTone } from "../../lib/glass/glassTones";
import { GLASS_ICON } from "./glassStyles";

interface GlassIconProps {
  icon: LucideIcon;
  tone: GlassTone;
  className?: string;
}

/** Runde Verlaufs-Plakette mit farbigem Schein; die Farbe ordnet eine Zeile auf einen Blick ein. */
export default function GlassIcon({ icon: Icon, tone, className }: GlassIconProps) {
  return (
    <span aria-hidden className={cn(GLASS_ICON, GLASS_TONES[tone].icon, className)}>
      <Icon className="h-[17px] w-[17px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" strokeWidth={2.3} />
    </span>
  );
}
