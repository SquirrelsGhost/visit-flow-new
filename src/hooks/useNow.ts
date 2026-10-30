import { useEffect, useState } from "react";

/** Aktuelle Zeit, die sich im angegebenen Takt erneuert (Countdown jede Sekunde, sonst jede Minute). */
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
