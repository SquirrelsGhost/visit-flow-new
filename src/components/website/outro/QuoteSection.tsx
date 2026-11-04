// Einblenden beim Sichtbarwerden: braucht den Browser
"use client";

import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { websiteSectionTexts } from "../../../texts/websiteSectionTexts";
import AccentText from "../ui/AccentText";

/**
 * Vorher/Nachher: links der Alltag ohne App (durchgestrichen, blass), rechts derselbe Moment mit Visit Flow.
 * Zeile für Zeile ein konkreter Unterschied, keine Kundenzitate.
 */
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
        <h2 className="mt-6 text-balance font-[family-name:var(--vfw-display)] text-[clamp(2.4rem,5.4vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-white">
          <AccentText text={t.title} />
        </h2>
        <div className="mt-14 grid grid-cols-2 gap-x-6 border-b border-white/[0.07] pb-4 text-[12px] font-semibold uppercase tracking-[0.24em] sm:gap-x-12">
          <span className="text-white/40">{t.before}</span>
          <span className="text-[#ff6b6b]">{t.after}</span>
        </div>
        <ul>
          {t.rows.map((row, i) => (
            <motion.li
              key={row.after}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
              className="grid grid-cols-2 items-center gap-x-6 border-b border-white/[0.07] py-6 sm:gap-x-12 sm:py-8"
            >
              <span className="flex items-start gap-3 text-[15px] text-white/40 line-through decoration-white/25 sm:text-xl">
                <X className="mt-1 size-4 shrink-0 text-white/30 sm:size-5" aria-hidden />
                {row.before}
              </span>
              <span className="flex items-start gap-3 font-[family-name:var(--vfw-display)] text-[16px] font-semibold tracking-[-0.01em] text-white sm:text-2xl">
                <Check className="mt-1 size-4 shrink-0 text-[#ff6b6b] sm:size-5" aria-hidden />
                {row.after}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
