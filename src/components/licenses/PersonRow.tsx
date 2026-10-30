import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { GLASS_CHEVRON, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../glass/glassStyles";
import PersonAvatar from "./PersonAvatar";

interface PersonRowProps {
  initial: string;
  muted: boolean;
  title: string;
  subtitle?: string;
  /** Status-Plakette rechts. */
  chip: ReactNode;
  onClick: () => void;
}

/** Person in einer Glasliste: Anfangsbuchstabe, Name und E-Mail, Status; Tippen öffnet die Details. */
export default function PersonRow({ initial, muted, title, subtitle, chip, onClick }: PersonRowProps) {
  return (
    <button type="button" onClick={onClick} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "group")}>
      <PersonAvatar initial={initial} muted={muted} />
      <span className="min-w-0 flex-1">
        <span className={cn(GLASS_TITLE, "truncate")}>{title}</span>
        {subtitle && <span className={cn(GLASS_SUBTITLE, "truncate")}>{subtitle}</span>}
      </span>
      {chip}
      <ChevronRight aria-hidden className={GLASS_CHEVRON} />
    </button>
  );
}
