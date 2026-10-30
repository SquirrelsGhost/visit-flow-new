import { cn } from "../../lib/cn";

interface PersonAvatarProps {
  initial: string;
  /** Gedämpft für Eingeladene und Inaktive. */
  muted?: boolean;
}

/** Runder Anfangsbuchstabe in der Größe der Glas-Symbole, damit Personen und Zeilen bündig stehen. */
export default function PersonAvatar({ initial, muted = false }: PersonAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[14px] font-semibold text-white ring-1 ring-inset ring-white/25 shadow-[0_6px_16px_-6px]",
        muted ? "from-slate-300 to-slate-500 shadow-slate-500/35 dark:from-slate-500 dark:to-slate-700" : "from-rose-400 to-red-600 shadow-red-500/45",
      )}
    >
      {initial}
    </span>
  );
}
