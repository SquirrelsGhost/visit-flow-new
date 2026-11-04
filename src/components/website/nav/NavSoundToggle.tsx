// Schaltet die Klänge der Website: braucht den Browser
"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useWebsiteSound } from "../../../hooks/website/useWebsiteSound";
import { websiteTexts } from "../../../texts/websiteTexts";

/** Kleiner runder Schalter: Klang an/aus. Standard aus. */
export interface NavSoundToggleProps { readonly _?: never; }

const t = websiteTexts.nav;

export default function NavSoundToggle() {
  const { on, toggle } = useWebsiteSound();
  const Icon = on ? Volume2 : VolumeX;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title={t.soundHint}
      aria-label={on ? t.soundOff : t.soundOn}
      className={`grid size-10 place-items-center rounded-full transition-colors ${
        on ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon className="size-[18px]" strokeWidth={2} />
    </button>
  );
}
