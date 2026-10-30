import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { roleLabel } from "../../texts/appTexts";
import { settingsTexts } from "../../texts/settingsTexts";
import GlassAvatar from "../glass/GlassAvatar";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassHeader from "../glass/GlassHeader";

const PROFILE_HREF = "/profile";

/** Kopf des Reiters Persönlich: wer gerade angemeldet ist, als tiefe Karte. Führt zum Profil, wo Name, Passwort und Abo liegen. */
export interface ProfileCardProps { readonly _?: never; }

export default function ProfileCard() {
  const { user } = useAuth();
  if (!user) return null;
  const name = user.name ?? user.email;
  return (
    <GlassCard variant="deep" sheen spotlight>
      <Link href={PROFILE_HREF} aria-label={settingsTexts.profileLink} className="group relative flex items-center gap-3 p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
        <div className="min-w-0 flex-1">
          <GlassHeader align="start" leading={<GlassAvatar initial={name.charAt(0).toUpperCase()} />} title={name} subtitle={user.email}>
            <GlassChip tone="red" onDeep>
              {roleLabel(user.role)}
            </GlassChip>
            {hasDemoSession() && (
              <GlassChip tone="amber" onDeep>
                {settingsTexts.demoBadge}
              </GlassChip>
            )}
          </GlassHeader>
        </div>
        <span className="relative hidden shrink-0 text-[13px] text-white/55 sm:inline">{settingsTexts.profileLinkShort}</span>
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
          <ChevronRight aria-hidden className="h-4 w-4 text-white/80" />
        </span>
      </Link>
    </GlassCard>
  );
}
