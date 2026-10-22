import type { Transition, Variants } from "motion/react";

/** Weiche, leicht gedämpfte Feder: wirkt hochwertig, ohne nachzuschwingen. */
export const SOFT_SPRING: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };

/** Schnellere Feder für kleine Elemente (Reiter-Markierung, Buttons). */
export const SNAPPY_SPRING: Transition = { type: "spring", stiffness: 420, damping: 34 };

/** Elternelement, das seine Kinder nacheinander einblendet. */
export const staggerParent = (stagger = 0.07, delay = 0.1): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Kind einer Staffel: steigt sanft auf und wird scharf. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: SOFT_SPRING },
};

/** Login-Karte: kommt leicht von unten, aus der Unschärfe und minimal kleiner; danach folgt der Inhalt Stück für Stück. */
export const cardIn: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.975, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...SOFT_SPRING, staggerChildren: 0.08, delayChildren: 0.15 },
  },
};
