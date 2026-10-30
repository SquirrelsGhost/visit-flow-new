import { cn } from "../../lib/cn";
import { DEFAULT_AVATAR, ROLE_AVATAR } from "../../lib/overview/roleStyles";

interface OrgAvatarProps {
  name: string;
  role: string;
  /** Farbe des Status-Punkts (Tagesstatus). */
  dot: string;
}

/** Runder Avatar mit Anfangsbuchstaben, Farbe nach Rolle und Tagesstatus-Punkt. */
export default function OrgAvatar({ name, role, dot }: OrgAvatarProps) {
  return (
    <span className="relative shrink-0">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-[15px] font-semibold text-white shadow-[0_6px_16px_-6px] ring-1 ring-inset ring-white/25", ROLE_AVATAR[role] ?? DEFAULT_AVATAR)}>
        {name.charAt(0).toUpperCase()}
      </span>
      <span aria-hidden className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-[2.5px] ring-[var(--aurora-base)]", dot)} />
    </span>
  );
}
