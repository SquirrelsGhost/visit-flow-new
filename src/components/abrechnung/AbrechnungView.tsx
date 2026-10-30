// Bereich, Monat und Demo-Sitzung kommen aus dem Browser
"use client";

import { motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { useMonthNav } from "../../hooks/useMonthNav";
import { useVertical } from "../../hooks/useVertical";
import { categoryOf } from "../../lib/abrechnung/abrechnungFormat";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { staggerParent } from "../../lib/motion/presets";
import AbrechnungBody from "./AbrechnungBody";
import AbrechnungHeader from "./AbrechnungHeader";
import EnergyLiveNotice from "./EnergyLiveNotice";
import MonthStepper from "./MonthStepper";

const subscribeNever = () => () => {};

/**
 * Abrechnung (/abrechnung, v1 AbrechnungPage): Partner-Abrechnung gegen getrackte Verkäufe abgleichen,
 * offene Punkte klären, reklamieren. Folgt dem Bereichs-Umschalter in der Topbar.
 */
export interface AbrechnungViewProps { readonly _?: never; }

export default function AbrechnungView() {
  const vertical = useVertical();
  const category = categoryOf(vertical);
  const nav = useMonthNav();
  // Demo-Sitzung liegt im sessionStorage; auf dem Server gilt "keine Demo", damit nichts falsch hydriert
  const demo = useSyncExternalStore(subscribeNever, hasDemoSession, () => false);

  return (
    <div className="abr-bg h-full w-full overflow-x-hidden overflow-y-auto px-4 pt-5 pb-40 md:px-6">
      <motion.div key={category} variants={staggerParent(0.06, 0.04)} initial="hidden" animate="show" className="mx-auto w-full max-w-2xl space-y-7 lg:max-w-6xl">
        <div className="space-y-3">
          <AbrechnungHeader category={category} demo={demo} />
          <MonthStepper value={nav.ref} dir={nav.dir} atLatest={nav.atLatest} onPrev={nav.prev} onNext={nav.next} />
        </div>
        {demo || category !== "energy" ? <AbrechnungBody category={category} nav={nav} /> : <EnergyLiveNotice />}
      </motion.div>
    </div>
  );
}
