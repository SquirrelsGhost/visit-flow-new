import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { loadSystemFlags, saveSystemFlags } from "../lib/admin/adminApi";
import type { SystemFlag, SystemFlags } from "../lib/admin/adminTypes";
import { adminTexts } from "../texts/adminTexts";

export interface SystemFlagsState {
  /** undefined = lädt, null = nicht verfügbar. */
  flags: SystemFlags | null | undefined;
  busy: SystemFlag | null;
  /** Schaltet um und speichert sofort; bei einem Fehler springt der Schalter zurück. */
  toggle: (flag: SystemFlag) => Promise<void>;
}

const texts = adminTexts.system;

export function useSystemFlags(): SystemFlagsState {
  const [flags, setFlags] = useState<SystemFlags | null | undefined>(undefined);
  const [busy, setBusy] = useState<SystemFlag | null>(null);

  useEffect(() => {
    let alive = true;
    void loadSystemFlags().then((next) => alive && setFlags(next), () => alive && setFlags(null));
    return () => {
      alive = false;
    };
  }, []);

  const toggle = useCallback(
    async (flag: SystemFlag) => {
      if (!flags) return;
      const value = !flags[flag];
      setBusy(flag);
      setFlags({ ...flags, [flag]: value });
      const ok = await saveSystemFlags({ [flag]: value });
      if (ok) toast.success(value ? texts.on : texts.off);
      else {
        setFlags({ ...flags, [flag]: !value });
        toast.error(texts.failed);
      }
      setBusy(null);
    },
    [flags],
  );

  return { flags, busy, toggle };
}
