import { useState } from "react";

/** Position in einem wischbaren Stapel samt Richtung des letzten Schritts (für die Gleitrichtung). */
export function useDeck(count: number) {
  const [state, setState] = useState({ index: 0, dir: 1 });
  const index = Math.min(state.index, Math.max(0, count - 1));
  const step = (s: 1 | -1) => setState({ index: Math.min(count - 1, Math.max(0, index + s)), dir: s });
  return { index, dir: state.dir, step };
}
