import { ClipboardCheck } from "lucide-react";
import { BACKOFFICE_PRICE } from "../../lib/backoffice/backofficeConfig";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";

interface BackofficeTeaserHeroProps {
  price: number;
}

/** Tiefe Kopfkarte des Angebots: Name, Versprechen in einem Satz, Richtpreis groß. */
export default function BackofficeTeaserHero({ price }: BackofficeTeaserHeroProps) {
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-6 pt-6">
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(245,158,11,0.45), transparent)" }} />
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{t.teaser.eyebrow}</p>
        {!BACKOFFICE_PRICE.final && (
          <GlassChip tone="amber" onDeep>
            {t.teaser.priceNote}
          </GlassChip>
        )}
      </div>
      <div className="relative mt-5 flex items-center gap-3">
        <span className="glass-keep-white grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-[0_10px_24px_-10px_rgba(234,88,12,0.8)]">
          <ClipboardCheck aria-hidden className="h-6 w-6" />
        </span>
        <h2 className="glass-text-shine text-[28px] font-semibold leading-tight tracking-[-0.02em]">{t.teaser.title}</h2>
      </div>
      <p className="relative mt-3 text-[14px] leading-relaxed text-white/70">{t.teaser.lead}</p>
      <div className="relative mt-5 flex items-baseline gap-2 border-t border-white/10 pt-4">
        <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-white">{t.teaser.price(price)}</span>
        <span className="text-[13px] text-white/55">{t.teaser.perMonth}</span>
      </div>
    </GlassCard>
  );
}
