import { useEffect, useState } from "react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/** Restzeit wie v1 DailyChallengeCard: "2d 5h", "3h 12m" oder in der letzten Minute "42s"; null = abgelaufen. */
export function formatRemaining(ms: number): string | null {
  if (ms <= 0) return null;
  if (ms < MINUTE) return `${Math.floor(ms / SECOND)}s`;
  const hours = Math.floor(ms / HOUR);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${Math.floor((ms % HOUR) / MINUTE)}m`;
}

/** Tickt jede Sekunde bis zum Ende und liefert Text und ob es knapp wird (unter zwei Stunden). */
export function useCountdown(endsAt: string) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), SECOND);
    return () => clearInterval(timer);
  }, []);
  const left = end - now;
  return { label: formatRemaining(left), urgent: left > 0 && left < 2 * HOUR };
}
