// Folgt Zeiger und Farbstimmung: braucht den Browser
"use client";

import { useRef, type CSSProperties } from "react";
import { usePointerGlow } from "../../hooks/website/usePointerGlow";
import { useWebsite } from "../../hooks/website/useWebsite";
import { TONE_KEYS, TONES } from "../../lib/website/websiteTones";

/** Fester Hintergrund hinter der ganzen Website: Lichter je Stimmung blenden ineinander, Raster, Korn, Zeiger-Licht. */
export interface WebsiteBackdropProps { readonly _?: never; }

export default function WebsiteBackdrop() {
  const { tone } = useWebsite();
  const cursor = useRef<HTMLDivElement>(null);
  usePointerGlow(cursor);

  return (
    <div aria-hidden className="vfw-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {TONE_KEYS.map((key) => (
        <div
          key={key}
          className="vfw-light"
          data-active={key === tone}
          style={{ "--a": TONES[key].a, "--b": TONES[key].b, opacity: key === tone ? 1 : 0 } as CSSProperties}
        />
      ))}
      <div className="vfw-grid" />
      <div ref={cursor} className="vfw-cursor" />
      <div className="vfw-grain" />
    </div>
  );
}
