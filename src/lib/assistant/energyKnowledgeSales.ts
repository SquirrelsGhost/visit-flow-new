import type { KnowledgeItem } from "./knowledgeTypes";

/** Wissensdatenbank Strom & Gas: Verkaufsargumente und Technik. */
export const ENERGY_KNOWLEDGE_B: readonly KnowledgeItem[] = [
  {
    id: "ev1",
    category: "verkauf",
    title: "Arbeitspreis und Grundpreis verständlich erklären",
    content:
      "🧮 DIE ZWEI PREISE:\n• Arbeitspreis: Cent pro kWh, also was jede verbrauchte Einheit kostet\n• Grundpreis: fester Betrag pro Monat, egal wie viel verbraucht wird\n\n🗣️ SO ERKLÄRST DU ES:\n\"Der Arbeitspreis ist wie der Literpreis an der Tankstelle, der Grundpreis wie eine Monatsgebühr.\"\n\n💶 RECHNUNG FÜR DEN KUNDEN:\nJahreskosten = Arbeitspreis × Jahresverbrauch + Grundpreis × 12\n\n🎯 VERKAUFSARGUMENT:\nBei hohem Verbrauch zählt vor allem der Arbeitspreis. Wenige Cent pro kWh machen schnell über 100 € im Jahr aus.",
    tags: ["arbeitspreis",  "grundpreis",  "kwh",  "kosten",  "erklären"],
  },
  {
    id: "ev2",
    category: "verkauf",
    title: "Preisgarantie richtig verkaufen",
    content:
      "🔒 ZWEI ARTEN:\n• Eingeschränkte Preisgarantie: Steuern, Abgaben und Netzentgelte können sich trotzdem ändern\n• Volle Preisgarantie: Der Preis bleibt komplett gleich (nur Mehrwertsteuer ausgenommen)\n\n🗣️ SO VERKAUFST DU ES:\n\"Egal was am Energiemarkt passiert, Ihr Preis ist für X Monate fest.\"\n\n🎯 STARKE KOMBINATION:\nPreisgarantie + Ersparnis + Bonus im ersten Jahr\n\n💡 Immer ehrlich sagen, welche Art von Garantie es ist.",
    tags: ["preisgarantie",  "sicherheit",  "festpreis",  "planbarkeit",  "energiemarkt"],
  },
  {
    id: "ev3",
    category: "verkauf",
    title: "Strom und Gas im Paket",
    content:
      "🔥⚡ DOPPELT SPAREN:\n• Wer Gas heizt, hat fast immer zwei Verträge\n• Beide Rechnungen ansehen, beide vergleichen\n• Ein Termin, zwei Abschlüsse\n\n🗣️ ERÖFFNUNG:\n\"Heizen Sie mit Gas? Dann schauen wir gleich auch auf die Gasrechnung, da ist meist noch mehr drin.\"\n\n🎯 VERKAUFSARGUMENT:\nEin Ansprechpartner, eine Übersicht, doppelte Ersparnis.",
    tags: ["gas",  "strom",  "paket",  "doppelt",  "heizung"],
  },
  {
    id: "ev4",
    category: "verkauf",
    title: "Ökostrom als Mehrwert",
    content:
      "🌱 ÖKOSTROM:\n• Strom aus erneuerbaren Quellen, oft ohne Aufpreis\n• Spricht Familien und umweltbewusste Kunden an\n\n🗣️ SO SAGST DU ES:\n\"Sie sparen Geld und beziehen gleichzeitig Ökostrom. Beides auf einmal.\"\n\n💡 Nicht als Hauptargument nutzen, sondern als Bonus obendrauf. Die Ersparnis überzeugt, Ökostrom gibt das gute Gefühl.",
    tags: ["ökostrom",  "umwelt",  "nachhaltig",  "erneuerbar",  "mehrwert"],
  },
  {
    id: "et1",
    category: "technik",
    title: "MaLo-ID und Zählernummer finden",
    content:
      "🔢 ZÄHLERNUMMER:\n• Steht direkt auf dem Zähler (oft unter einem Strichcode)\n• Steht auch auf der Jahresabrechnung\n\n🆔 MARKTLOKATIONS-ID (MaLo-ID):\n• 11-stellige Nummer, eindeutig für die Lieferstelle\n• Steht auf der Jahresabrechnung, oft im Bereich \"Lieferstelle\" oder \"Zählpunkt\"\n• Hilft dem Netzbetreiber, die Lieferstelle sicher zuzuordnen\n\n💡 Am besten die Rechnung abfotografieren. Dann sind alle Nummern auf einmal da.",
    tags: ["malo",  "marktlokation",  "zählernummer",  "zählpunkt",  "rechnung"],
  },
  {
    id: "et2",
    category: "technik",
    title: "Verbrauch schätzen ohne Rechnung",
    content:
      "📊 RICHTWERTE STROM PRO JAHR (Wohnung, ohne Strom-Warmwasser):\n• 1 Person: ca. 1.500 kWh\n• 2 Personen: ca. 2.500 kWh\n• 3 Personen: ca. 3.200 kWh\n• 4 Personen: ca. 4.000 kWh\n\n🏠 Im Haus und mit Warmwasser über Strom liegt der Verbrauch deutlich höher.\n\n🔥 GAS:\n• Grob 120–150 kWh pro m² Wohnfläche im Jahr bei Heizung und Warmwasser\n\n💡 Schätzwerte nur nutzen, wenn keine Abrechnung da ist, und im Auftrag als Schätzung kennzeichnen.",
    tags: ["verbrauch",  "kwh",  "schätzen",  "richtwerte",  "haushalt"],
  },
  {
    id: "et3",
    category: "technik",
    title: "Gas: Kubikmeter in kWh umrechnen",
    content:
      "🔥 DIE FORMEL:\nkWh = Kubikmeter (m³) × Zustandszahl × Brennwert\n\n📋 WO STEHT WAS:\n• Kubikmeter: Zählerstand-Differenz auf dem Gaszähler\n• Zustandszahl und Brennwert: auf der Gasrechnung\n• Faustregel: 1 m³ Erdgas ≈ 10 kWh\n\n💡 Für den Vergleich immer den kWh-Wert von der Rechnung nehmen, nicht die m³.",
    tags: ["gas",  "kubikmeter",  "brennwert",  "zustandszahl",  "umrechnung"],
  },
  {
    id: "et4",
    category: "technik",
    title: "Smart Meter und moderne Zähler",
    content:
      "📟 ZWEI ARTEN:\n• Moderne Messeinrichtung: digitaler Zähler ohne Kommunikationsmodul\n• Intelligentes Messsystem (Smart Meter): digitaler Zähler mit Gateway, sendet Daten\n\n📋 PFLICHTEINBAU (Messstellenbetriebsgesetz):\n• Ab 6.000 kWh Jahresverbrauch\n• Mit Wärmepumpe, Wallbox oder PV-Anlage über 7 kW\n\n💡 Der Zählertyp ändert nichts am Anbieterwechsel. Der Messstellenbetreiber bleibt zuständig.",
    tags: ["smart meter",  "zähler",  "messsystem",  "digital",  "pflicht"],
  },
  {
    id: "et5",
    category: "technik",
    title: "Wärmepumpe, Wallbox und Nachtspeicher",
    content:
      "🌡️ EIGENE TARIFE:\n• Wärmepumpen und Nachtspeicher haben oft einen eigenen Zähler und Tarif\n• Zwei-Tarif-Zähler: HT (Hochtarif, Tag) und NT (Niedertarif, Nacht)\n\n⚡ STEUERBARE VERBRAUCHER (§ 14a EnWG):\n• Wärmepumpe und Wallbox können vom Netzbetreiber gedimmt werden\n• Dafür gibt es reduzierte Netzentgelte\n\n✅ BEIM AUFTRAG:\n• Fragen: \"Gibt es einen zweiten Zähler für Heizung oder Auto?\"\n• Beide Zählernummern und beide Stände (HT/NT) notieren\n\n💡 Nur Tarife anbieten, die ausdrücklich für Wärmepumpe oder Nachtspeicher gelten.",
    tags: ["wärmepumpe",  "wallbox",  "nachtspeicher",  "14a",  "zweitarif"],
  },
];
