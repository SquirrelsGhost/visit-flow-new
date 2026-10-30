import type { KnowledgeItem } from "./knowledgeTypes";

/** Einwandbehandlung, Texte wortgleich aus v1 (ai.kb.e1–e8 in de.json). */
export const KNOWLEDGE_EINWAND: readonly KnowledgeItem[] = [
  {
    id: "e1",
    category: "einwand",
    title: "Zu teuer / Preis zu hoch",
    content:
      "✅ RICHTIGE VORGEHENSWEISE:\n1. Verstehen: \"Ich verstehe, dass der Preis wichtig ist. Darf ich fragen, womit Sie vergleichen?\"\n2. Wert zeigen: \"Lassen Sie uns die Gesamtkosten über 24 Monate vergleichen...\"\n3. Konkret rechnen: \"Sie zahlen aktuell 39,99€ für 50 Mbit/s. Bei uns bekommen Sie 250 Mbit/s für 44,99€ - das sind 5€ mehr für 5x mehr Geschwindigkeit!\"\n4. GigaKombi nutzen: \"Mit Ihrem Handyvertrag sparen Sie zusätzlich 5€/Monat - macht effektiv 39,99€!\"\n5. Mehrwert betonen: \"Plus: Kostenloser Premium-Router (Wert 149€), kostenlose Installation, 24/7 Hotline\"\n\n💡 PROFI-TIPP: Niemals sofort Rabatt anbieten! Erst Wert aufbauen, dann ggf. Sonderkonditionen.",
    tags: ["preis", "kosten", "teuer", "vergleich", "wert"],
  },
  {
    id: "e2",
    category: "einwand",
    title: "Ich bin zufrieden mit meinem Anbieter",
    content:
      "✅ RICHTIGE VORGEHENSWEISE:\n1. Anerkennen: \"Das freut mich zu hören! Zufriedenheit ist wichtig.\"\n2. Neugierig machen: \"Darf ich fragen, was Sie am meisten schätzen?\"\n3. Verbesserung zeigen: \"Perfekt! Genau das bieten wir auch - PLUS...\"\n4. Konkret werden: \"Wie viel Datenvolumen haben Sie aktuell?\" → \"Wir bieten Ihnen 50% mehr zum gleichen Preis!\"\n5. Zukunft ansprechen: \"Ihr Vertrag läuft noch bis...? Perfekt, dann können wir jetzt schon planen.\"\n\n💡 PROFI-TIPP: Nicht gegen den alten Anbieter sprechen! Fokus auf Verbesserung, nicht Wechsel.\n🎯 ZIEL: Termin für späteren Wechsel vereinbaren, nicht sofort verkaufen.",
    tags: ["zufrieden", "kein bedarf", "konkurrenz", "wechsel"],
  },
  {
    id: "e3",
    category: "einwand",
    title: "Keine Zeit / Bin beschäftigt",
    content:
      "✅ RICHTIGE VORGEHENSWEISE:\n1. Respekt zeigen: \"Verstehe ich vollkommen, ich sehe Sie sind beschäftigt.\"\n2. Zeit einschätzen: \"Dauert nur 90 Sekunden - ich zeige Ihnen eine Möglichkeit, 240€ zu sparen.\"\n3. Alternative anbieten: \"Oder: Wann passt es besser? Morgen um 18 Uhr? Samstag vormittag?\"\n4. Infomaterial: \"Ich lasse Ihnen meine Karte und einen Flyer da - Sie können mich jederzeit anrufen.\"\n5. Termin fixieren: \"Ich trage Sie für Samstag 10 Uhr ein - passt das?\"\n\n💡 PROFI-TIPP: Bei \"keine Zeit\" oft nur Ausrede. Wert in Sekunden kommunizieren: \"90 Sekunden für 240€ Ersparnis\"\n🎯 WICHTIG: Immer konkreten Termin anbieten, nie \"irgendwann mal\".",
    tags: ["zeit", "beschäftigt", "termin", "später"],
  },
  {
    id: "e4",
    category: "einwand",
    title: "Vertragslaufzeit zu lang / Keine Bindung",
    content:
      "✅ RICHTIGE VORGEHENSWEISE:\n1. Verstehen: \"Ich verstehe. Flexibilität ist wichtig. Darf ich fragen warum?\"\n2. Vorteile zeigen: \"24 Monate Laufzeit bedeutet: Planbare Kosten, keine Preiserhöhungen, beste Konditionen\"\n3. Flexibilität aufzeigen: \"Nach 12 Monaten haben Sie ein Sonderkündigungsrecht bei Umzug oder Nichtverfügbarkeit\"\n4. Rechnen: \"Monatlich kündbar kostet 15€ mehr pro Monat = 360€ in 2 Jahren. Lohnt sich das?\"\n5. Sicherheit geben: \"Vodafone-Garantie: Bei Unzufriedenheit in den ersten 30 Tagen kostenfrei kündbar\"\n\n💡 PROFI-TIPP: Fragen \"Planen Sie in den nächsten 2 Jahren umzuziehen?\" - meist NEIN → dann ist Laufzeit kein Problem.",
    tags: ["vertrag", "laufzeit", "bindung", "flexibilität"],
  },
  {
    id: "e5",
    category: "einwand",
    title: "Muss mit Partner/Familie sprechen",
    content:
      "✅ RICHTIGE VORGEHENSWEISE:\n1. Respektieren: \"Absolut richtig! Wichtige Entscheidungen sollte man gemeinsam treffen.\"\n2. Helfen: \"Gerne erkläre ich es Ihnen beiden zusammen. Wann ist Ihr Partner da?\"\n3. Material geben: \"Ich lasse Ihnen alle Infos da - Tarif, Preise, Vorteile. Besprechen Sie es in Ruhe.\"\n4. Termin fixieren: \"Ich komme morgen um 18 Uhr nochmal vorbei - passt das?\"\n5. Kontakt sichern: \"Oder rufen Sie mich an wenn Sie sich entschieden haben: [Ihre Nummer]\"\n\n💡 PROFI-TIPP: Oft echte Entscheidung! Nicht drängen, sondern Termin für gemeinsames Gespräch vereinbaren.\n🎯 WICHTIG: Infomaterial mit Ihrer Handynummer dalassen!",
    tags: ["entscheidung", "familie", "partner", "gemeinsam"],
  },
  {
    id: "e6",
    category: "einwand",
    title: "Brauche kein schnelles Internet",
    content:
      "✅ RICHTIGE VORGEHENSWEISE:\n1. Verstehen: \"Wie nutzen Sie Ihr Internet aktuell? Nur E-Mails oder auch Videos?\"\n2. Zukunft zeigen: \"Heute reicht 50 Mbit/s - aber in 2 Jahren? 4K-Streaming, Smart Home, Home Office?\"\n3. Mehrwert: \"Für nur 5€ mehr bekommen Sie 5x mehr Geschwindigkeit - als Absicherung für die Zukunft\"\n4. Familie einbeziehen: \"Wie viele Geräte sind gleichzeitig online? Handy, Tablet, TV, Laptop?\"\n5. Konkret werden: \"Ärgern Sie sich manchmal über langsames Internet? Das wäre dann Geschichte!\"\n\n💡 PROFI-TIPP: Fragen nach aktueller Nutzung → dann Probleme aufzeigen → Lösung präsentieren.",
    tags: ["geschwindigkeit", "bedarf", "nutzung", "zukunft"],
  },
  {
    id: "e7",
    category: "einwand",
    title: "Hatte schlechte Erfahrungen mit Vodafone",
    content:
      "✅ RICHTIGE VORGEHENSWEISE:\n1. Ernst nehmen: \"Das tut mir leid zu hören. Was ist passiert?\"\n2. Zuhören: Lassen Sie den Kunden ausreden, zeigen Sie Verständnis\n3. Veränderung zeigen: \"Ich verstehe. Vodafone hat in den letzten Jahren massiv investiert: 2 Mrd€/Jahr in Netzausbau\"\n4. Fakten: \"Heute: Bestes Netz laut Connect, 99% LTE-Abdeckung, ausgezeichneter Kundenservice\"\n5. Garantie: \"30 Tage Zufriedenheitsgarantie - wenn Sie nicht zufrieden sind, kostenfrei kündbar\"\n6. Persönlich: \"Ich bin Ihr persönlicher Ansprechpartner - bei Problemen rufen Sie mich direkt an!\"\n\n💡 PROFI-TIPP: Nicht rechtfertigen oder widersprechen! Zuhören, verstehen, neue Perspektive zeigen.",
    tags: ["erfahrung", "probleme", "service", "vertrauen"],
  },
  {
    id: "e8",
    category: "einwand",
    title: "Bin gerade erst gewechselt",
    content:
      "✅ RICHTIGE VORGEHENSWEISE:\n1. Akzeptieren: \"Verstehe! Zu welchem Anbieter sind Sie gewechselt?\"\n2. Laufzeit erfragen: \"Wie lange läuft Ihr neuer Vertrag? 24 Monate?\"\n3. Vormerken: \"Perfekt! Ich notiere mir das - ich melde mich 3 Monate vor Vertragsende bei Ihnen\"\n4. Interesse wecken: \"Nur kurz: Was zahlen Sie aktuell und was bekommen Sie dafür?\"\n5. Vergleich zeigen: \"Interessant! Bei uns würden Sie für den gleichen Preis... bekommen. Denken Sie daran!\"\n\n💡 PROFI-TIPP: Nicht aufgeben! Termin für späteren Kontakt vereinbaren. Visitenkarte dalassen.\n🎯 WICHTIG: In CRM eintragen mit Wiedervorlage-Datum!",
    tags: ["wechsel", "vertrag", "laufzeit", "timing"],
  },
];
