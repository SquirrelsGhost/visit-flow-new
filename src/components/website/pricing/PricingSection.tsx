// Schieberegler mit Live-Preis: braucht den Browser
"use client";

import { useState } from "react";
import { siteFeedback } from "../../../lib/website/websiteFeedback";
import { websiteSectionTexts } from "../../../texts/websiteSectionTexts";
import AccentText from "../ui/AccentText";
import PriceSlider from "./PriceSlider";
import PriceTotal from "./PriceTotal";

/** Preise als ruhige Doppelseite: links Satz und Bedingungen, rechts großer Preis mit Regler für die Teamgröße. */
export interface PricingSectionProps { readonly _?: never; }

const t = websiteSectionTexts.pricing;
const START = 10;

export default function PricingSection() {
  const [team, setTeam] = useState(START);

  const change = (next: number) => {
    if (next === team) return;
    siteFeedback(next % 5 === 0 ? "select" : "tap");
    setTeam(next);
  };

  return (
    <section id="preise" aria-labelledby="vfw-price-title" className="scroll-mt-24 border-t border-white/[0.07] px-6 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-white/50">
            <span className="h-px w-8 bg-white/25" />
            {t.kicker}
          </p>
          <h2 id="vfw-price-title" className="mt-6 text-balance font-[family-name:var(--vfw-display)] text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[0.98] tracking-[-0.045em]">
            <AccentText text={t.title} />
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/65">{t.lead}</p>
          <p className="mt-8 max-w-md border-l border-[#ff6b6b] pl-4 text-white/75">
            <strong className="font-semibold text-white">{t.addOnTitle}</strong> · {t.addOnText}
          </p>
        </div>
        <div className="lg:pt-10">
          <p className="flex items-baseline gap-3">
            <span className="font-[family-name:var(--vfw-display)] text-[clamp(5rem,12vw,9rem)] font-extrabold leading-none tracking-[-0.06em] text-white">
              {t.perLicense}&nbsp;€
            </span>
          </p>
          <p className="mt-2 text-white/55">{t.unit}</p>
          <PriceSlider team={team} onChange={change} />
          <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-6">
            <p className="text-sm text-white/45">{t.note}</p>
            <PriceTotal team={team} />
          </div>
        </div>
      </div>
    </section>
  );
}
