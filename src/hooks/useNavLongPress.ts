import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { hapticFeedback } from "../lib/device/haptics";

/** Kürzer als das Kontextmenü von Android (~500 ms), damit unser Sheet zuerst kommt. */
const HOLD_MS = 420;
/** Ab so viel Bewegung (px) ist es ein Wischen, kein Halten. */
const MOVE_TOLERANCE = 10;
/** So lange nach dem Loslassen wird ein Klick noch verschluckt. */
const SWALLOW_AFTER_RELEASE_MS = 350;

/**
 * Verschluckt den Klick, der beim Loslassen kommt. Der Finger liegt dann schon über dem frisch geöffneten Sheet;
 * ohne das würde der Link die Seite wechseln oder im Sheet gleich eine Zeile gewählt.
 */
function swallowNextClick(): void {
  const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const release = () => {
    window.setTimeout(() => document.removeEventListener("click", swallow, true), SWALLOW_AFTER_RELEASE_MS);
    document.removeEventListener("pointerup", release, true);
    document.removeEventListener("pointercancel", release, true);
  };
  document.addEventListener("click", swallow, { capture: true, once: true });
  document.addEventListener("pointerup", release, true);
  document.addEventListener("pointercancel", release, true);
}

/**
 * Langes Drücken auf einen Link der Leiste, mit Finger, Stift oder Maus (Rechtsklick geht auch).
 * Das Kontextmenü und das Markieren des Browsers kommen nie; der Klick danach wechselt nicht die Seite.
 */
export function useNavLongPress(onLongPress: () => void) {
  const [pressing, setPressing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef({ x: 0, y: 0 });
  /** Schon ausgelöst in diesem Druck: das spätere Kontextmenü von Android öffnet dann nicht noch einmal. */
  const fired = useRef(false);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPressing(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const fire = useCallback(() => {
    cancel();
    fired.current = true;
    swallowNextClick();
    hapticFeedback("medium");
    onLongPress();
  }, [cancel, onLongPress]);

  return {
    pressing,
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        fired.current = false;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        start.current = { x: e.clientX, y: e.clientY };
        setPressing(true);
        timer.current = setTimeout(fire, HOLD_MS);
      },
      onPointerMove: (e: PointerEvent) => {
        if (!timer.current) return;
        if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > MOVE_TOLERANCE) cancel();
      },
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onPointerLeave: cancel,
      onContextMenu: (e: MouseEvent) => {
        e.preventDefault();
        if (!fired.current) fire();
      },
      onDragStart: (e: MouseEvent) => e.preventDefault(),
    },
  };
}
