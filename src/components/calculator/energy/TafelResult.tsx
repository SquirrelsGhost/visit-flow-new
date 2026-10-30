// Ersparnis zählt beim Erscheinen hoch
"use client";

import { motion } from "motion/react";
import { formatEuro } from "../../../lib/energy/energyNumbers";
import type { Tafel } from "../../../lib/energy/energyTafel";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { energyTafelTexts as t } from "../../../texts/energyTexts";
import AnimatedEuro from "../../ui/AnimatedEuro";

interface TafelResultProps {
  tafel: Tafel;
}

/** Das Ergebnis: "Sie sparen" mit hochzählendem Betrag, dazu Jahr 2, Preisgarantie und geschenkte Monate. */
export default function TafelResult({ tafel }: TafelResultProps) {
  const e = tafel.ergebnis;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SOFT_SPRING}
      className="mt-8 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-5 shadow-[0_0_60px_-20px_rgba(252,211,77,0.45)]"
    >
      {e.ersparnisJahr1Cent > 0 ? (
        <>
          <div className="text-xs font-black uppercase tracking-widest text-amber-300">{t.sieSparen}</div>
          <AnimatedEuro
            key={tafel.titel}
            value={e.ersparnisJahr1Cent / 100}
            from={0}
            duration={1.1}
            className="mt-1 block font-mono text-4xl font-black tabular-nums text-amber-300"
          />
          <div className="text-sm text-amber-100/80">{e.bonusCent > 0 ? t.imJahr1 : t.proJahr}</div>
          <div className="mt-4 space-y-1.5 text-[15px]">
            {e.bonusCent > 0 &&
              (e.ersparnisAbJahr2Cent > 0 ? (
                <div>
                  <span className="font-mono font-bold tabular-nums">{formatEuro(e.ersparnisAbJahr2Cent)}</span> {t.abJahr2}
                </div>
              ) : (
                <div className="text-white/60">{t.keinVorteilAbJahr2}</div>
              ))}
            {e.ersparnisGarantieCent !== null && e.ersparnisGarantieCent > 0 && e.preisgarantieMonate && (
              <div>
                <span className="font-mono font-bold tabular-nums">{formatEuro(e.ersparnisGarantieCent)}</span>{" "}
                {t.garantie(e.preisgarantieMonate)}
              </div>
            )}
            {e.monateGeschenkt >= 1 && <div className="text-amber-200">{t.geschenkt(e.monateGeschenkt, t.geschenktWas[tafel.art])}</div>}
          </div>
        </>
      ) : (
        <div className="text-lg font-bold text-white/80">{t.keinVorteil}</div>
      )}
    </motion.div>
  );
}
