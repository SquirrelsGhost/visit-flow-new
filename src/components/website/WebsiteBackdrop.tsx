// Folgt Zeiger und Farbstimmung: braucht den Browser
"use client";

import type { CSSProperties } from "react";
import { useWebsite } from "../../hooks/website/useWebsite";
import { TONE_KEYS, TONES } from "../../lib/website/websiteTones";

/** Fester Hintergrund hinter der ganzen Website: Lichter je Stimmung blenden ineinander, Raster, Korn, Zeiger-Licht. */
export interface WebsiteBackdropProps { readonly _?: never; }

export default function WebsiteBackdrop() {
  const { tone } = useWebsite();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {TONE_KEYS.map((key) => (
        <div
          key={key}
          className="vfw-light"
          style={{ "--a": TONES[key].a, "--b": TONES[key].b, opacity: key === tone ? 1 : 0 } as CSSProperties}
        />
      ))}
      <div className="vfw-grid" />
      <div className="vfw-cursor" />
      <div className="vfw-grain" />
    </div>
  );
}
