import { useState } from "react";

export type HeroPhase = "arena" | "recap";

/** Welche Seite der Kopfkarte offen ist: die Arena von heute oder der Rückblick auf den letzten Battle-Tag. */
export function useHeroPhase(initial: HeroPhase = "arena") {
  const [phase, setPhase] = useState<HeroPhase>(initial);
  return { phase, setPhase };
}
