import { formatEuro } from "../../../lib/energy/energyNumbers";
import { energyTexts as t } from "../../../texts/energyTexts";
import AnimatedEuro from "../../ui/AnimatedEuro";
import StepHead from "../StepHead";

interface PanelHeadProps {
  schritt: number;
  titel: string;
  hinweis: string;
  /** Kosten pro Jahr in Cent, sobald sie sich rechnen lassen */
  jahrCent: number | null;
  fertig: boolean;
  /** Veraltet: der Haken ist im Glas-Design überall grün. */
  aktivKlasse?: string;
}

/** Kopf eines Eingabeblocks im Energievergleich: Schritt, Titel, Hilfe und rechts die Jahreskosten. */
export default function PanelHead({ schritt, titel, hinweis, jahrCent, fertig }: PanelHeadProps) {
  return (
    <StepHead
      schritt={schritt}
      titel={titel}
      hinweis={hinweis}
      fertig={fertig}
      trailing={
        jahrCent !== null && (
          <div className="shrink-0 text-right" aria-label={`${formatEuro(jahrCent)} ${t.proJahr}`}>
            <AnimatedEuro value={jahrCent / 100} className="block text-[15px] font-semibold tracking-[-0.01em] tabular-nums" />
            <span className="block text-[10px] text-muted-foreground">{t.proJahr}</span>
          </div>
        )
      }
    />
  );
}
