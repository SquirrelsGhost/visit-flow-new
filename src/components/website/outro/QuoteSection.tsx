// Einblenden beim Sichtbarwerden: braucht den Browser
"use client";

import { motion } from "motion/react";
import { websiteSectionTexts } from "../../../texts/websiteSectionTexts";

/** Stimme aus der Praxis, groß gesetzt wie in einem Magazin: Zitat in Serifenschrift, darunter die 45 Berater als Punkte. */
export interface QuoteSectionProps { readonly _?: never; }

const t = websiteSectionTexts.proof;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function QuoteSection() {
  return (
    <section id="stimme" aria-label={t.kicker} className="scroll-mt-24 border-t border-white/[0.07] px-6 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-white/50">
          <span className="h-px w-8 bg-white/25" />
          {t.kicker}
        </p>
        <motion.blockquote
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="mt-10 text-balance font-[family-name:var(--vfw-serif)] text-[clamp(2rem,4.6vw,4.2rem)] italic leading-[1.08] tracking-[-0.01em] text-white"
        >
          „{t.quote}“
        </motion.blockquote>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
          <p className="text-white/60">
            <strong className="block font-[family-name:var(--vfw-display)] text-xl font-semibold text-white">{t.name}</strong>
            {t.role}
          </p>
          <div role="img" aria-label={t.crewLabel} className="flex max-w-md flex-wrap gap-1.5">
            {Array.from({ length: 45 }, (_, i) => (
              <motion.i
                key={i}
                className={`size-3 rounded-full ${i < 10 ? "bg-[#ff4d4d] shadow-[0_0_10px_rgba(239,68,68,0.7)]" : "bg-white/70"}`}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i < 10 ? i * 0.04 : 0.5 + (i - 10) * 0.025, type: "spring", stiffness: 300, damping: 18 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
