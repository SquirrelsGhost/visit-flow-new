import type { AuthUser } from "@/shared/auth/authSchemas";
import { roleLabel } from "../../texts/appTexts";
import UserAvatar from "./UserAvatar";

interface UserMenuHeaderProps {
  user: AuthUser;
}

/** Kopf des Benutzermenüs wie in v1: Avatar, Name, E-Mail und die Rolle als Plakette. */
export default function UserMenuHeader({ user }: UserMenuHeaderProps) {
  return (
    <div className="glass-deep shrink-0 rounded-none px-4 py-4">
      <div className="flex items-center gap-3">
        <UserAvatar name={user.name ?? user.email} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-white">{user.name}</p>
          <p className="truncate text-xs text-white/60">{user.email}</p>
        </div>
      </div>
      <span className="mt-3 inline-flex items-center rounded-full bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-100 ring-1 ring-inset ring-red-300/25">
        {roleLabel(user.role)}
      </span>
    </div>
  );
}
