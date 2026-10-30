import type { KnowledgeItem } from "./knowledgeTypes";

/** Wissensdatenbank Lead (Solar): Einwände und häufige Fragen. Ziel an der Tür ist der Beratungstermin, nicht der Anlagenverkauf. */
export const SOLAR_KNOWLEDGE_A: readonly KnowledgeItem[] = [
  {
    id: "se1",
    category: "einwand",
    title: "Zu teuer / Dafür habe ich kein Geld",
    content:
      "🎯 WORUM ES GEHT: Du verkaufst heute keine Anlage, sondern einen kostenlosen Beratungstermin.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Verstehen: \"Absolut verständlich, niemand will einfach so Geld ausgeben.\"\n2. Umdrehen: \"Sie zahlen den Strom so oder so, die Frage ist nur, ob an den Versorger oder in die eigene Anlage.\"\n3. Optionen nennen: Kauf, Finanzierung oder Miete ohne Anschaffungskosten.\n4. Termin sichern: \"Der Fachberater rechnet Ihnen das unverbindlich aus. Passt Ihnen Dienstag oder Donnerstag besser?\"\n\n💡 PROFI-TIPP: Nie über Anlagenpreise diskutieren. Das macht der Fachberater mit echten Dachdaten.",
    tags: ["preis",  "teuer",  "geld",  "miete",  "finanzierung"],
  },
  {
    id: "se2",
    category: "einwand",
    title: "Lohnt sich das überhaupt noch?",
    content:
      "☀️ KURZ GESAGT: Seit die Einspeisevergütung gesunken ist, lohnt sich vor allem der eigene Verbrauch.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Frage stellen: \"Wie hoch ist Ihre Stromrechnung im Monat ungefähr?\"\n2. Rechnen lassen: Jede selbst verbrauchte kWh ersetzt teuren Netzstrom.\n3. Speicher erwähnen: Mit Speicher steigt der Eigenverbrauch deutlich.\n4. Termin: \"Ob es sich bei Ihrem Dach rechnet, zeigt die kostenlose Berechnung.\"\n\n💡 PROFI-TIPP: Wer Wärmepumpe oder E-Auto hat oder plant, ist fast immer ein starker Lead.",
    tags: ["lohnt",  "rentabel",  "eigenverbrauch",  "amortisation",  "einspeisung"],
  },
  {
    id: "se3",
    category: "einwand",
    title: "Mein Dach ist zu alt / nicht geeignet",
    content:
      "🏠 KEIN AUSSCHLUSS: Ein altes Dach ist oft sogar ein guter Anlass.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Nachfragen: \"Wie alt ist das Dach ungefähr? Steht eine Sanierung an?\"\n2. Verbinden: Steht in den nächsten Jahren eine Sanierung an, lassen sich Dach und Anlage zusammen planen.\n3. Ausrichtung klären: Süd ist ideal, Ost-West funktioniert auch gut. Nur reine Norddächer sind schwierig.\n4. Prüfen lassen: \"Ob Ihr Dach passt, prüft der Fachberater kostenlos, auch per Satellitenbild.\"\n\n💡 PROFI-TIPP: Ausrichtung, Verschattung und Dachalter im Lead notieren. Das spart dem Fachberater Zeit.",
    tags: ["dach",  "alt",  "ausrichtung",  "sanierung",  "norddach"],
  },
  {
    id: "se4",
    category: "einwand",
    title: "Ich warte, bis es billiger wird",
    content:
      "⏳ WARTEN KOSTET: Jeden Monat ohne Anlage zahlt der Kunde den vollen Strompreis.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Bestätigen: \"Die Preise für Module sind in den letzten Jahren tatsächlich gefallen.\"\n2. Gegenrechnen: \"Gleichzeitig bezahlen Sie jeden Monat weiter Ihre Stromrechnung. Das ist Geld, das nicht zurückkommt.\"\n3. Unverbindlich bleiben: \"Lassen Sie es sich einmal durchrechnen, dann entscheiden Sie mit Zahlen statt Bauchgefühl.\"\n4. Termin sichern.\n\n💡 PROFI-TIPP: Den Termin als Information verkaufen, nicht als Kaufentscheidung.",
    tags: ["warten",  "billiger",  "später",  "preise",  "zeitpunkt"],
  },
  {
    id: "se5",
    category: "einwand",
    title: "Ich habe keine Zeit für einen Termin",
    content:
      "📅 ZEIT IST DAS ARGUMENT: Der Termin spart später viel Zeit beim Vergleichen.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Klein machen: \"Das Gespräch dauert etwa 45 Minuten, auch abends oder am Samstag.\"\n2. Alternative: Termin auch telefonisch oder per Video möglich, je nach Partner.\n3. Konkret werden: Zwei feste Zeitfenster anbieten statt \"wann passt es Ihnen?\".\n4. Beide Entscheider: \"Ist Ihr Partner dann auch da? Dann müssen Sie nichts doppelt erklären.\"\n\n💡 PROFI-TIPP: Ein Lead ohne festen Termin ist nur ein halber Lead.",
    tags: ["zeit",  "termin",  "beschäftigt",  "abends",  "entscheider"],
  },
  {
    id: "se6",
    category: "einwand",
    title: "Ich bin nur Mieter",
    content:
      "🔑 KEIN LEAD FÜR DACHANLAGEN: Über das Dach entscheidet der Eigentümer.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Freundlich klären: \"Gehört das Haus Ihnen oder wohnen Sie zur Miete?\"\n2. Nach dem Eigentümer fragen: \"Wohnt der Vermieter im Haus oder in der Nähe?\"\n3. Empfehlung sichern: Kontakt zum Eigentümer oder zu Nachbarn mit eigenem Haus erfragen.\n4. Nicht als Lead erfassen, wenn kein Eigentümer erreichbar ist.\n\n💡 PROFI-TIPP: Eigentum immer zuerst klären. Mieter-Leads werden fast immer storniert.",
    tags: ["mieter",  "eigentümer",  "vermieter",  "qualifizierung",  "storno"],
  },
  {
    id: "sf1",
    category: "faq",
    title: "Was passiert nach dem Lead?",
    content:
      "🔄 ABLAUF:\n1. Du erfasst den Lead mit allen Infos aus dem Lead-Check\n2. Der Fachberater meldet sich und bestätigt den Termin\n3. Beratung mit Dachprüfung und Wirtschaftlichkeitsrechnung\n4. Angebot, danach Planung und Montage\n5. Anmeldung beim Netzbetreiber und im Marktstammdatenregister übernimmt in der Regel der Installateur\n\n💡 Je vollständiger der Lead, desto höher die Chance auf Abschluss und desto weniger Stornos.",
    tags: ["ablauf",  "lead",  "termin",  "fachberater",  "montage"],
  },
  {
    id: "sf2",
    category: "faq",
    title: "Was ist ein Netto-Lead?",
    content:
      "📊 NETTO-LEAD:\n• Ein Lead, der nicht storniert wurde\n• Nur Netto-Leads zählen für deinen Lead-Bonus im Reiter \"Ich\"\n\n❌ TYPISCHE STORNO-GRÜNDE:\n• Kunde ist Mieter\n• Kein Entscheider beim Termin\n• Dach offensichtlich ungeeignet\n• Kunde wusste nichts vom Termin\n\n💡 Sauber qualifizieren lohnt sich doppelt: mehr Nettos, mehr Bonus.",
    tags: ["netto",  "storno",  "bonus",  "qualität",  "lead"],
  },
  {
    id: "sf3",
    category: "faq",
    title: "0 % Mehrwertsteuer auf PV",
    content:
      "💶 WAS GILT (seit 1. Januar 2023, § 12 Abs. 3 UStG):\n• 0 % Mehrwertsteuer auf Kauf und Installation von PV-Anlagen\n• Für Anlagen bis 30 kWp auf oder an Wohngebäuden\n• Gilt auch für Speicher\n\n🎯 VERKAUFSARGUMENT:\n\"Der Staat verzichtet auf die 19 % Mehrwertsteuer. Das macht den Einstieg deutlich günstiger.\" ",
    tags: ["mehrwertsteuer",  "steuer",  "nullsteuersatz",  "förderung",  "kosten"],
  },
  {
    id: "sf4",
    category: "faq",
    title: "Einspeisevergütung",
    content:
      "⚡ SO FUNKTIONIERT ES:\n• Überschüssiger Strom wird ins Netz eingespeist und vergütet\n• Der Satz gilt fest für 20 Jahre (plus Jahr der Inbetriebnahme)\n• Neue Anlagen bekommen weniger als früher, die Sätze sinken regelmäßig\n\n🗣️ SO ERKLÄRST DU ES:\n\"Die Einspeisung ist ein Zubrot. Richtig sparen Sie mit dem Strom, den Sie selbst verbrauchen.\"\n\n💡 Aktuelle Sätze nennt die Bundesnetzagentur. Keine festen Cent-Beträge versprechen.",
    tags: ["einspeisevergütung",  "eeg",  "netz",  "vergütung",  "überschuss"],
  },
];
