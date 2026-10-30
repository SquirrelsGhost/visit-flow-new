import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

/** Zählt beim Erscheinen weich bis zum Wert hoch; bei reduzierter Bewegung steht die Zahl sofort. */
export default function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const current = useMotionValue(reduced ? value : 0);
  const text = useTransform(current, (v) => Math.round(v).toLocaleString("de-DE"));

  useEffect(() => {
    const controls = animate(current, value, reduced ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [current, value, reduced]);

  return <motion.span className={className}>{text}</motion.span>;
}
