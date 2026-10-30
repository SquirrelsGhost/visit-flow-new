import { useEffect, useState } from "react";
import { toast } from "sonner";
import { dayKey } from "../lib/battle/arenaScore";
import { loadAdminBattles } from "../lib/battle/battleApi";
import type { AdminBattle, StreakMap } from "../lib/battle/battleTypes";
import { battleLogTexts } from "../texts/battleAdminTexts";

/** Battle-Historie eines Tages samt Serien, für Admin und Teamleiter. */
export function useBattleLogs(open: boolean) {
  const [date, setDate] = useState(() => dayKey(new Date()));
  const [battles, setBattles] = useState<AdminBattle[]>([]);
  const [streaks, setStreaks] = useState<StreakMap>({});
  const [loadedDate, setLoadedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !date) return;
    let active = true;
    void loadAdminBattles(date).then((result) => {
      if (!active) return;
      setLoadedDate(date);
      if (!result) return void toast.error(battleLogTexts.loadFailed);
      setBattles(result.battles);
      setStreaks(result.streaks);
    });
    return () => {
      active = false;
    };
  }, [open, date]);

  return { date, setDate, battles, streaks, loading: loadedDate !== date };
}
