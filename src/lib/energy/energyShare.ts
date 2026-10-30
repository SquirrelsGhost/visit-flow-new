import { summe, type Ergebnis } from "./energyCalc";
import { formatEuro } from "./energyNumbers";

/** Text zum Teilen per WhatsApp & Co. Enthält bewusst keine Kundendaten (v1 teilenText). */
export function teilenText(t: { strom?: Ergebnis; gas?: Ergebnis; berater?: string }): string {
  const zeilen: string[] = ["Ihre Energiekosten im Vergleich", ""];
  const sparte = (name: string, e: Ergebnis) => {
    const bonus = e.bonusCent > 0 ? ` (dazu ${formatEuro(e.bonusCent)} Bonus im 1. Jahr)` : "";
    zeilen.push(`${name}: heute ${formatEuro(e.altJahrCent)} pro Jahr, neu ${formatEuro(e.neuJahrCent)} pro Jahr${bonus}`);
  };
  if (t.strom) sparte("Strom", t.strom);
  if (t.gas) sparte("Gas", t.gas);
  const gesamt = t.strom && t.gas ? summe(t.strom, t.gas) : t.strom || t.gas;
  if (gesamt) {
    zeilen.push("");
    if (gesamt.ersparnisJahr1Cent > 0) {
      zeilen.push(`Sie sparen ${formatEuro(gesamt.ersparnisJahr1Cent)} im 1. Jahr.`);
      if (gesamt.ersparnisAbJahr2Cent > 0) zeilen.push(`Ab Jahr 2: ${formatEuro(gesamt.ersparnisAbJahr2Cent)} pro Jahr.`);
      if (gesamt.ersparnisGarantieCent !== null && gesamt.preisgarantieMonate) {
        zeilen.push(`Über ${gesamt.preisgarantieMonate} Monate Preisgarantie: ${formatEuro(gesamt.ersparnisGarantieCent)}.`);
      }
    } else {
      zeilen.push("Bei diesen Preisen gibt es keinen Preisvorteil.");
    }
    if (gesamt.geschaetzt) zeilen.push("Geschätzt auf Basis Ihres monatlichen Abschlags.");
  }
  if (t.berater) zeilen.push("", `Ihr Berater: ${t.berater}`);
  return zeilen.join("\n");
}
