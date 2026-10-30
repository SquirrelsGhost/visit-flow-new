import type { ReactNode } from "react";
import PersonAvatar from "../PersonAvatar";

interface PersonHeaderProps {
  initial: string;
  muted: boolean;
  title: string;
  subtitle?: string;
  chip: ReactNode;
}

/** Kopf eines Personen-Sheets: Anfangsbuchstabe, Name, E-Mail und Status in einer Glasfläche. */
export default function PersonHeader({ initial, muted, title, subtitle, chip }: PersonHeaderProps) {
  return (
    <div className="glass-surface flex items-center gap-3.5 rounded-[22px] px-4 py-3.5">
      <PersonAvatar initial={initial} muted={muted} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-foreground">{title}</p>
        {subtitle && <p className="truncate text-[12.5px] text-muted-foreground">{subtitle}</p>}
      </div>
      {chip}
    </div>
  );
}
