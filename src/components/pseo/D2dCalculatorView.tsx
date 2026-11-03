import Link from "next/link";
import D2dCommissionCalculator from "@/components/pseo/D2dCommissionCalculator";
import PseoFooterSection from "@/components/pseo/PseoFooterSection";
import PseoHeaderNav from "@/components/pseo/PseoHeaderNav";
import { D2D_INDUSTRIES } from "@/lib/pseo/visitFlowPseoData";

export interface D2dCalculatorViewProps {
  readonly _?: never;
}

const CALCULATOR_FAQS = [
  {
    q: "Was unterscheidet eine spezialisierte D2D Provisionsabrechnung Software von Excel?",
    a: "Im Haustürvertrieb (Glasfaser, Solar, Energie) fallen Stornoreserven, Staffelprovisionen, Teamleiter-Overrides und Nachbearbeitungs-Abzüge an. Visit Flow verknüpft jeden Auftrag an der Haustür direkt mit der Provisions-Engine und erstellt revisionssichere PDF-Gutschriften auf Knopfdruck.",
  },
  {
    q: "Wie wird die Stornoreserve im Direktvertrieb optimal berechnet?",
    a: "Üblich sind 10 % bis 20 % Sicherheitseinbehalt über 6 bis 12 Monate (abhängig von Widerrufs- und Anschaltfristen im FTTH- oder PV-Vertrieb). In Visit Flow hinterlegst du den Einbehalt pro Produkt und gibst fällige Reserven automatisiert frei.",
  },
  {
    q: "Können Berater ihren eigenen Provisionsstand live in der App sehen?",
    a: "Ja. Jeder Berater sieht im integrierten Provisions-Simulator und Abrechnungs-Cockpit live seine eingereichten Aufträge, freigegebenen Auszahlungen, Stornoreserven und die nächste Bonus-Stufe.",
  },
] as const;

export default function D2dCalculatorView(_props: D2dCalculatorViewProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Visit Flow – D2D Provisionsabrechnung Software & Rechner",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        url: "https://visit-flow.com/rechner/d2d-provisionsabrechnung",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          description: "Kostenloser Online-Provisionsrechner & 14 Tage Team-Testphase",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: CALCULATOR_FAQS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#07070b] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PseoHeaderNav activeSection="calculator" />

      <main className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase">
            Provisionsabrechnung Software · Direktvertrieb & Strukturvertrieb
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            D2D-Provisionsrechner & automatische Provisionsabrechnung
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
            Schluss mit fehleranfälligen Excel-Listen am Monatsende: Berechne hier live
            Team-Provisionen, Stornoreserven und Struktur-Overrides – und automatisiere
            deine komplette Abrechnung direkt aus der Laufliste heraus.
          </p>
        </div>

        <div className="mt-10">
          <D2dCommissionCalculator />
        </div>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-lg font-bold text-white">1. Aufträge direkt von der Tür</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Jeder Abschluss in der Laufliste fließt automatisch mit Tarif, Produkt-Punkten
              und Berater-ID in das Abrechnungsmodul – ohne doppelte Abtipparbeit.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-lg font-bold text-white">2. Mehrstufige Struktur-Logik</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Egal ob Junior-Berater, Mentor, Teamleiter oder Strukturleiter: Differenz-
              und Override-Provisionen sowie Qualitäts-Staffeln werden sekundengenau berechnet.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-lg font-bold text-white">3. Stornoreserve & PDF-Gutschrift</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Automatischer Sicherheitseinbehalt je Carrier, transparente Storno-Verrechnung
              und fertige PDF-Abrechnungen für dein gesamtes Vertriebsteam.
            </p>
          </article>
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">
            Provisions-Benchmarks nach D2D-Branche (2026)
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {D2D_INDUSTRIES.map((ind) => (
              <Link
                key={ind.slug}
                href={`/d2d-vertrieb/${ind.slug}`}
                className="group rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-rose-500/40"
              >
                <p className="text-xs font-semibold text-rose-400">{ind.shortLabel}</p>
                <p className="mt-1 text-lg font-bold text-white">{ind.avgCommissionEur}</p>
                <p className="mt-1 text-xs text-zinc-400">Ø {ind.avgDoorsPerDay}</p>
                <p className="mt-3 text-xs font-medium text-zinc-300 group-hover:text-rose-300">
                  Leitfaden & Software →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white">
            Häufige Fragen zur D2D-Provisionsabrechnung
          </h2>
          <div className="mt-6 space-y-4">
            {CALCULATOR_FAQS.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <h3 className="text-base font-bold text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PseoFooterSection />
    </div>
  );
}
