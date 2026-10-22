import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

/** Alle Animationen der App. Wer im System "Bewegung reduzieren" eingestellt hat, bekommt nur Überblendungen. */
export default function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
