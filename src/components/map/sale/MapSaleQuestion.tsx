// Braucht useState für die Eingabe des Altpreises
"use client";

import { useState } from "react";
import { gigaCubeOptions, parseOldPrice, type SaleAnswers, type SaleQuestion } from "../../../lib/map/saleProducts";
import type { Tariff } from "../../../lib/tariff/tariffTypes";
import FadeSwap from "../../ui/FadeSwap";
import { STEP_INPUT } from "../steps/stepStyles";
import MapSaleHeader from "./MapSaleHeader";

interface MapSaleQuestionProps {
  question: SaleQuestion;
  tariff: Tariff;
  color: string;
  onBack: () => void;
  onAnswer: (patch: SaleAnswers) => void;
}

interface YesNo {
  title: string;
  text: string;
  info?: string;
  yes: string;
  no: string;
  key: "creditGiven" | "firstInstall" | "oldRouter" | "tvConnect";
}

/** Texte wie in v1 (de.json saleDialog.*Dialog). */
const YES_NO: Partial<Record<SaleQuestion, (t: Tariff) => YesNo>> = {
  credit: (t) => ({
    title: "Startguthaben gegeben?",
    text: `Dieser Tarif hat ${t.startCredit ?? 0}€ Startguthaben. Wurde es dem Kunden gegeben?`,
    yes: "Ja, gegeben",
    no: "Nein, nicht gegeben",
    key: "creditGiven",
  }),
  firstInstall: () => ({
    title: "First Install?",
    text: "Ist dies eine Erstinstallation für Kabel?",
    info: "Bei First Install wird ein Techniker-Termin fällig.",
    yes: "Ja, First Install",
    no: "Nein, kein First Install",
    key: "firstInstall",
  }),
  oldRouter: () => ({
    title: "Alter Router?",
    text: "Hat der Kunde einen alten Router?",
    info: "Bei altem Router steht nach einer Woche die Einrichtung an.",
    yes: "Ja, alter Router",
    no: "Nein, kein alter Router",
    key: "oldRouter",
  }),
  tvConnect: () => ({
    title: "TV Connect verkauft?",
    text: "Wurde TV Connect zuhause auch mitverkauft? Bei Ja kommt es automatisch dazu.",
    info: "Hat der Kunde bereits einen EHT oder ein aktives KAS, kann TV Connect nicht neu verkauft werden, nur das bestehende Produkt rabattiert.",
    yes: "Ja, TV Connect verkauft",
    no: "Nein, ohne TV Connect",
    key: "tvConnect",
  }),
};

const ANSWER = "w-full rounded-2xl px-4 py-3.5 text-sm font-bold transition active:scale-[0.98]";
const SECONDARY = `${ANSWER} border border-[var(--glass-divider)] bg-card text-slate-800 dark:bg-white/5 dark:text-white`;

/** Eine Rückfrage nach dem Tarif-Tipp (v1: Startguthaben, First Install, Altpreis, Router, TV Connect, GigaCube). */
export default function MapSaleQuestion({ question, tariff, color, onBack, onAnswer }: MapSaleQuestionProps) {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const yesNo = YES_NO[question]?.(tariff);
  const header = (title: string) => <MapSaleHeader title={title} icon="❓" color={color} onBack={onBack} />;

  if (yesNo) {
    return (
      <FadeSwap>
        {header(yesNo.title)}
        <p className="mb-2 text-sm text-slate-700 dark:text-white/80">{yesNo.text}</p>
        {yesNo.info && <p className="mb-4 rounded-xl bg-blue-500/10 px-3 py-2 text-xs text-blue-700 dark:text-blue-200">{yesNo.info}</p>}
        <div className="space-y-2">
          <button type="button" className={`${ANSWER} text-white shadow-lg`} style={{ background: color }} onClick={() => onAnswer({ [yesNo.key]: true })}>
            {yesNo.yes}
          </button>
          <button type="button" className={SECONDARY} onClick={() => onAnswer({ [yesNo.key]: false })}>
            {yesNo.no}
          </button>
        </div>
      </FadeSwap>
    );
  }

  if (question === "oldPrice") {
    const confirm = () => {
      const parsed = parseOldPrice(price);
      if (parsed === null) return setError("Bitte einen gültigen Preis zwischen 0 und 999,99 € eingeben");
      onAnswer({ oldPrice: parsed });
    };
    return (
      <FadeSwap>
        {header("Alter Preis?")}
        <p className="mb-3 text-sm text-slate-700 dark:text-white/80">Was hat der Kunde bisher monatlich gezahlt?</p>
        <input
          inputMode="decimal"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setError("");
          }}
          placeholder="z. B. 34,99"
          className={STEP_INPUT}
          aria-invalid={Boolean(error)}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        <div className="mt-4 space-y-2">
          <button type="button" className={`${ANSWER} text-white shadow-lg`} style={{ background: color }} onClick={confirm}>
            Weiter
          </button>
          <button type="button" className={SECONDARY} onClick={() => onAnswer({ oldPrice: undefined })}>
            Überspringen
          </button>
        </div>
      </FadeSwap>
    );
  }

  return (
    <FadeSwap>
      {header("GigaCube Hardware")}
      <div className="space-y-2">
        {gigaCubeOptions(tariff).map((o) => (
          <button key={o.id} type="button" className={SECONDARY} onClick={() => onAnswer({ gigaCubeHardware: o.suffix })}>
            <span className="block">{o.label}</span>
            {o.hint && <span className="block text-xs font-medium opacity-60">{o.hint}</span>}
          </button>
        ))}
      </div>
    </FadeSwap>
  );
}
