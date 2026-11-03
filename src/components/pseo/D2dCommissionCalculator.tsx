// Needs useState for interactive D2D commission, storno reserve & team ROI sliders
"use client";

import Link from "next/link";
import { useState } from "react";

export interface D2dCommissionCalculatorProps {
  defaultCommissionEur?: number;
}

const WORK_DAYS_PER_MONTH = 21;

export default function D2dCommissionCalculator({
  defaultCommissionEur = 180,
}: D2dCommissionCalculatorProps) {
  const [reps, setReps] = useState(8);
  const [dealsPerDay, setDealsPerDay] = useState(2.5);
  const [commissionEur, setCommissionEur] = useState(defaultCommissionEur);
  const [overridePct, setOverridePct] = useState(18);
  const [stornoPct, setStornoPct] = useState(16);
  const [reservePct, setReservePct] = useState(10);

  const monthlyDealsRaw = Math.round(reps * dealsPerDay * WORK_DAYS_PER_MONTH);
  const grossVolumeEur = monthlyDealsRaw * commissionEur;
  const stornoLossEur = Math.round(grossVolumeEur * (stornoPct / 100));
  const netVolumeAfterStorno = grossVolumeEur - stornoLossEur;
  const reserveHoldbackEur = Math.round(netVolumeAfterStorno * (reservePct / 100));
  const immediatePayoutEur = netVolumeAfterStorno - reserveHoldbackEur;
  const teamLeadOverrideEur = Math.round(netVolumeAfterStorno * (overridePct / 100));

  const vfDeals = Math.round(monthlyDealsRaw * 1.22);
  const vfStornoPct = Math.max(4, +(stornoPct * 0.62).toFixed(1));
  const vfNetVolume = Math.round(vfDeals * commissionEur * (1 - vfStornoPct / 100));
  const monthlyGainWithVf = Math.max(0, vfNetVolume - netVolumeAfterStorno);

  const sliders = [
    { label: "Aktive D2D-Berater im Team", valLabel: `${reps} Berater`, min: 1, max: 60, step: 1, val: reps, set: setReps },
    { label: "Ø Abschlüsse / Berater / Tag", valLabel: `${dealsPerDay.toFixed(1)} Aufträge`, min: 0.5, max: 8, step: 0.5, val: dealsPerDay, set: setDealsPerDay },
    { label: "Ø Basis-Provision pro Auftrag", valLabel: `${commissionEur} €`, min: 50, max: 600, step: 10, val: commissionEur, set: setCommissionEur },
    { label: "Aktuelle Storno-/Widerrufsquote", valLabel: `${stornoPct} %`, min: 3, max: 35, step: 1, val: stornoPct, set: setStornoPct },
    { label: "Stornoreserve-Einbehalt", valLabel: `${reservePct} %`, min: 0, max: 25, step: 1, val: reservePct, set: setReservePct },
    { label: "Struktur-/Teamleiter-Override", valLabel: `${overridePct} %`, min: 0, max: 35, step: 1, val: overridePct, set: setOverridePct },
  ];

  return (
    <section className="rounded-3xl border border-white/12 bg-zinc-900/75 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div>
            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
              Interaktiver Echtzeit-Simulator
            </span>
            <h2 className="mt-3 text-xl font-bold text-white sm:text-2xl">
              Team-Provision, Stornoreserve & Struktur-Override berechnen
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {sliders.map((s) => (
              <label key={s.label} className="block rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>{s.label}</span>
                  <strong className="text-sm text-white">{s.valLabel}</strong>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.val}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="mt-2 w-full accent-rose-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/40 via-zinc-950 to-zinc-950 p-6 lg:col-span-5">
          <div>
            <p className="text-xs font-semibold tracking-wider text-rose-300 uppercase">
              Monatliche Auswertung (21 Einsatztage)
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] text-zinc-400">Aufträge / Monat</p>
                <p className="mt-1 text-xl font-bold text-white">{monthlyDealsRaw.toLocaleString("de-DE")}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] text-zinc-400">Brutto-Provision</p>
                <p className="mt-1 text-xl font-bold text-white">{grossVolumeEur.toLocaleString("de-DE")} €</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-[11px] text-amber-300">Verlust durch Stornos</p>
                <p className="mt-1 text-lg font-bold text-amber-300">-{stornoLossEur.toLocaleString("de-DE")} €</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] text-zinc-400">Stornoreserve ({reservePct}%)</p>
                <p className="mt-1 text-lg font-bold text-zinc-200">{reserveHoldbackEur.toLocaleString("de-DE")} €</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-400">Sofort-Auszahlung (Netto):</span>
                <span className="text-2xl font-extrabold text-white">
                  {immediatePayoutEur.toLocaleString("de-DE")} €
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-2">
                <span className="text-xs text-zinc-400">Struktur-Override ({overridePct}%):</span>
                <span className="text-sm font-bold text-rose-300">
                  +{teamLeadOverrideEur.toLocaleString("de-DE")} €
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold text-emerald-300">
                Potenzial mit Visit Flow (+22 % Schlagzahl / {vfStornoPct} % Storno):
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-200">
                +{monthlyGainWithVf.toLocaleString("de-DE")} € / Monat
              </p>
            </div>
          </div>

          <Link
            href="/onboarding"
            className="mt-6 block rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition hover:from-rose-500 hover:to-red-400"
          >
            Jetzt mit eigenem Team starten →
          </Link>
        </div>
      </div>
    </section>
  );
}
