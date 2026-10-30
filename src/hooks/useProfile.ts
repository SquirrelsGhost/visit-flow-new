import { useCallback, useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { hasDemoSession } from "../lib/auth/demoSession";
import { saveProfile } from "../lib/profile/profileApi";
import { DEMO_PROFILE_FIELDS, readDemoPatch } from "../lib/profile/profileDemoData";
import { readProfile } from "../lib/profile/profileFields";
import type { ProfileData, ProfilePatch } from "../lib/profile/profileTypes";
import { useAuth } from "./useAuth";

const subscribeNever = () => () => {};

export interface ProfileState {
  profile: ProfileData | null;
  demo: boolean;
  /** Speichert Felder am Server (Demo: im Tab) und übernimmt sie sofort; true bei Erfolg. */
  save: (patch: ProfilePatch, successMessage: string) => Promise<boolean>;
}

/** Profil des angemeldeten Benutzers. Die Demo ergänzt Beispielfelder und merkt sich Änderungen im Tab. */
export function useProfile(): ProfileState {
  const { user, updateUser } = useAuth();
  // Demo-Sitzung liegt im sessionStorage; auf dem Server gilt "keine Demo", damit nichts falsch hydriert
  const demo = useSyncExternalStore(subscribeNever, hasDemoSession, () => false);

  const profile = useMemo(() => {
    if (!user) return null;
    return readProfile(demo ? { ...DEMO_PROFILE_FIELDS, ...user, ...readDemoPatch() } : user);
  }, [user, demo]);

  const save = useCallback(
    async (patch: ProfilePatch, successMessage: string) => {
      const result = await saveProfile(patch);
      if (!result.ok) {
        toast.error(result.message);
        return false;
      }
      updateUser(patch);
      toast.success(successMessage);
      return true;
    },
    [updateUser],
  );

  return { profile, demo, save };
}
