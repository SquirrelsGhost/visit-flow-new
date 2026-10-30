import { useCallback, useEffect, useRef, type MouseEvent } from "react";

const LONG_PRESS_MS = 800;

/** Langes Drücken (Touch) oder Rechtsklick lösen dieselbe Aktion aus, wie in v1. */
export function useLongPress(onLongPress: (() => void) | null) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  if (!onLongPress) return {};
  return {
    onTouchStart: () => {
      stop();
      timer.current = setTimeout(onLongPress, LONG_PRESS_MS);
    },
    onTouchEnd: stop,
    onTouchCancel: stop,
    onTouchMove: stop,
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      onLongPress();
    },
  };
}
