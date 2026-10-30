import type { KnowledgeItem } from "./knowledgeTypes";

/** Wissensdatenbank Lead (Solar): Verkaufsargumente und Technik. */
export const SOLAR_KNOWLEDGE_B: readonly KnowledgeItem[] = [
  {
    id: "sv1",
    category: "verkauf",
    title: "Die Stromrechnung als Türöffner",
    content:
      "🚪 ERÖFFNUNG:\n\"Darf ich Sie kurz fragen, wie viel Sie im Monat für Strom zahlen?\"\n\n📈 WEITER:\n• \"Und wie oft ist der Preis in den letzten Jahren gestiegen?\"\n• \"Was wäre, wenn ein großer Teil davon von Ihrem eigenen Dach käme?\"\n\n🎯 ÜBERGANG ZUM TERMIN:\n\"Ob und wie viel Ihr Dach schafft, rechnet Ihnen unser Fachberater kostenlos aus.\"\n\n💡 Fragen statt erzählen. Der Kunde soll den Gedanken selbst haben.",
    tags: ["stromrechnung",  "eröffnung",  "türöffner",  "fragen",  "strompreis"],
  },
  {
    id: "sv2",
    category: "verkauf",
    title: "Kaufen oder mieten?",
    content:
      "🏷️ KAUF:\n• Höchste Ersparnis auf lange Sicht\n• 0 % Mehrwertsteuer\n• Auch mit Finanzierung möglich\n\n🔑 MIETE:\n• Keine Anschaffungskosten\n• Feste monatliche Rate, Wartung und Versicherung oft inklusive\n• Ideal für Kunden, die nicht investieren wollen\n\n🗣️ \"Ob kaufen oder mieten, entscheiden Sie nach der Beratung. Beides ist möglich.\" ",
    tags: ["miete",  "kauf",  "finanzierung",  "rate",  "investition"],
  },
  {
    id: "sv3",
    category: "verkauf",
    title: "Speicher, Wärmepumpe und Wallbox",
    content:
      "🔋 SPEICHER:\n• Speichert Mittagsstrom für den Abend\n• Erhöht den Eigenverbrauch deutlich\n\n🌡️ WÄRMEPUMPE & 🚗 WALLBOX:\n• Großer Stromverbraucher = großer Nutzen der eigenen Anlage\n• Paket aus PV, Speicher und Wärmepumpe oder Wallbox ist besonders attraktiv\n\n✅ IM LEAD-CHECK FRAGEN:\n\"Haben oder planen Sie eine Wärmepumpe oder ein E-Auto?\"\n\n💡 Solche Leads haben die höchste Abschlusschance.",
    tags: ["speicher",  "wärmepumpe",  "wallbox",  "e-auto",  "paket"],
  },
  {
    id: "sv4",
    category: "verkauf",
    title: "Unabhängigkeit verkaufen",
    content:
      "🛡️ DAS GEFÜHL ZÄHLT:\n• Weniger abhängig von Strompreiserhöhungen\n• Eigener Strom vom eigenen Dach\n• Wertsteigerung der Immobilie\n\n🗣️ SO SAGST DU ES:\n\"Sie machen sich ein Stück unabhängig. Egal was der Strompreis macht, ein Teil Ihres Stroms kommt vom eigenen Dach.\" ",
    tags: ["unabhängigkeit",  "autarkie",  "strompreis",  "immobilie",  "wert"],
  },
  {
    id: "st1",
    category: "technik",
    title: "Größe und Ertrag grob schätzen",
    content:
      "📐 FAUSTREGELN:\n• 1 kWp braucht etwa 5–6 m² Dachfläche\n• 1 kWp erzeugt in Deutschland etwa 900–1.100 kWh im Jahr\n• Typisches Einfamilienhaus: 8–12 kWp\n\n💡 Nur als Gesprächshilfe nutzen. Die genaue Planung macht der Fachberater.",
    tags: ["kwp",  "ertrag",  "größe",  "dachfläche",  "faustregel"],
  },
  {
    id: "st2",
    category: "technik",
    title: "Dachausrichtung und Verschattung",
    content:
      "🧭 AUSRICHTUNG:\n• Süd: bester Ertrag\n• Ost-West: etwas weniger Ertrag, dafür gleichmäßiger über den Tag\n• Nord: meist ungeeignet\n\n🌳 VERSCHATTUNG:\n• Bäume, Gauben, Schornsteine, Nachbarhäuser beachten\n• Teilverschattung mindert den Ertrag, schließt aber nicht aus\n\n✅ IM LEAD NOTIEREN:\nAusrichtung, Dachneigung grob, Verschattung, Dachmaterial",
    tags: ["ausrichtung",  "süd",  "ost-west",  "verschattung",  "dach"],
  },
  {
    id: "st3",
    category: "technik",
    title: "Eigenverbrauch und Speicher",
    content:
      "🔌 EIGENVERBRAUCH:\n• Ohne Speicher: grob 25–35 % des Solarstroms selbst genutzt\n• Mit Speicher: grob 60–80 %\n\n🔋 SPEICHERGRÖSSE:\n• Faustregel: etwa 1 kWh Speicher je 1.000 kWh Jahresverbrauch\n\n💡 Werte schwanken je nach Haushalt. Nur als Richtwert nennen.",
    tags: ["eigenverbrauch",  "speicher",  "autarkie",  "kwh",  "richtwert"],
  },
  {
    id: "st4",
    category: "technik",
    title: "kW, kWp und kWh einfach erklärt",
    content:
      "📘 BEGRIFFE:\n• kWp (Kilowatt-Peak): maximale Leistung der Anlage unter Testbedingungen\n• kWh (Kilowattstunde): erzeugte oder verbrauchte Energiemenge\n• kW: Leistung im Moment, z. B. eines Wechselrichters\n\n🗣️ VERGLEICH:\n\"kWp ist wie die PS-Zahl beim Auto, kWh wie die gefahrenen Kilometer.\" ",
    tags: ["kwp",  "kwh",  "leistung",  "begriffe",  "erklären"],
  },
];
