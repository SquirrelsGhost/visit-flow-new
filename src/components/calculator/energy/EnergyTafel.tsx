// Portal an <body> und Ein-/Ausblenden brauchen den Browser
"use client";

import { AnimatePresence } from "motion/react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import TafelScreen, { type TafelScreenProps } from "./TafelScreen";

const subscribeNever = () => () => {};

interface EnergyTafelProps extends TafelScreenProps {
  open: boolean;
}

/**
 * Die Tafel im Portal: <main> und der Rechner-Slider haben Transforms, ein fixed-Vollbild säße sonst falsch.
 * Jedes Öffnen beginnt wieder bei der ersten Zeile.
 */
export default function EnergyTafel({ open, ...props }: EnergyTafelProps) {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<AnimatePresence>{open && props.teile.length > 0 && <TafelScreen {...props} />}</AnimatePresence>, document.body);
}
