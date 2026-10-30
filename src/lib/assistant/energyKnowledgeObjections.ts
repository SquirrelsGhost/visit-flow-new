import type { KnowledgeItem } from "./knowledgeTypes";

/** Wissensdatenbank Strom & Gas: Einwände und häufige Fragen. Rechtsquellen wie im Energie-Rechner aus v1. */
export const ENERGY_KNOWLEDGE_A: readonly KnowledgeItem[] = [
  {
    id: "ee1",
    category: "einwand",
    title: "Ich bin zufrieden / bei den Stadtwerken",
    content:
      "🎯 WORUM ES GEHT: Zufrieden heißt nicht günstig. Viele Kunden zahlen seit Jahren zu viel, ohne es zu merken.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Bestätigen: \"Schön, dass alles läuft. Genau so soll es auch bleiben.\"\n2. Neugierig machen: \"Darf ich kurz auf Ihre letzte Jahresabrechnung schauen? Dauert zwei Minuten.\"\n3. Rechnen: Arbeitspreis × Jahresverbrauch + Grundpreis × 12 gegen unser Angebot stellen.\n4. Ergebnis nennen: \"Sie zahlen X € im Jahr mehr als nötig, für denselben Strom aus derselben Leitung.\"\n5. Sicherheit geben: Zähler, Leitung und Netzbetreiber bleiben gleich, nur die Rechnung wird günstiger.\n\n💡 PROFI-TIPP: Den Energie-Rechner im D2D-Reiter nutzen und die Ersparnis direkt am Küchentisch zeigen.",
    tags: ["zufrieden",  "stadtwerke",  "treue",  "vergleich",  "rechnung"],
  },
  {
    id: "ee2",
    category: "einwand",
    title: "Ist das sicher? Was, wenn der Anbieter pleitegeht?",
    content:
      "🛡️ DIE ANTWORT IN EINEM SATZ: Strom und Gas fließen immer weiter.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Ernst nehmen: \"Gute Frage, das fragen viele seit der Energiekrise.\"\n2. Erklären: \"Gibt es keinen Liefervertrag mehr, liefert automatisch der Grundversorger weiter (Ersatzversorgung, § 38 EnWG).\"\n3. Beruhigen: \"Zähler und Leitungen bleiben, wie sie sind. Sie sitzen nie im Dunkeln.\"\n4. Vertrauen aufbauen: Seriosität des Partners nennen (Größe, Jahre am Markt, Preisgarantie).\n\n💡 PROFI-TIPP: Ruhig und sachlich bleiben. Wer die Rechtslage kennt, wirkt kompetent.",
    tags: ["sicherheit",  "pleite",  "insolvenz",  "ersatzversorgung",  "grundversorger"],
  },
  {
    id: "ee3",
    category: "einwand",
    title: "Zu viel Aufwand / Fällt beim Wechsel der Strom aus?",
    content:
      "⚡ KURZ GESAGT: Der Kunde unterschreibt, den Rest machen wir.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Entlasten: \"Sie müssen nichts kündigen und nirgends anrufen. Das übernimmt der neue Anbieter.\"\n2. Rechtlich absichern: \"Der Wechsel darf Sie nichts extra kosten. Die Anmeldung beim Netzbetreiber macht der neue Anbieter (§ 20a EnWG).\"\n3. Angst nehmen: \"Es gibt keine Unterbrechung. Kein Techniker, kein neuer Zähler.\"\n4. Zeigen, was nötig ist: Zählernummer, Zählerstand, alter Anbieter, IBAN. Mehr nicht.\n\n💡 PROFI-TIPP: Zählerstand gleich gemeinsam am Zähler ablesen und abfotografieren.",
    tags: ["aufwand",  "stromausfall",  "wechsel",  "kompliziert",  "kündigung"],
  },
  {
    id: "ee4",
    category: "einwand",
    title: "Mein Vertrag läuft noch",
    content:
      "📅 KEIN PROBLEM: Ein laufender Vertrag ist kein Grund, heute nicht zu unterschreiben.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Lösung anbieten: \"Wir tragen den Wechsel einfach zum Vertragsende ein.\"\n2. Preiserhöhung prüfen: \"Hat Ihr Anbieter die Preise erhöht? Dann können Sie ohne Frist zum Änderungstermin kündigen (§ 41 Abs. 5 EnWG).\"\n3. Grundversorgung prüfen: In der Grundversorgung gilt nur 2 Wochen Kündigungsfrist (§ 20 StromGVV / GasGVV).\n4. Neuere Verträge: Nach der Mindestlaufzeit sind Verträge ab März 2022 monatlich kündbar.\n\n💡 PROFI-TIPP: Immer nach dem letzten Preisbrief fragen. Eine Preiserhöhung öffnet fast jede Tür.",
    tags: ["vertrag",  "laufzeit",  "kündigungsfrist",  "sonderkündigung",  "preiserhöhung"],
  },
  {
    id: "ee5",
    category: "einwand",
    title: "Ich muss erst mit meinem Partner sprechen",
    content:
      "👥 VERSTÄNDLICH: Bei Haushaltskosten entscheidet man gern gemeinsam.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Respektieren: \"Natürlich, das ist eine gemeinsame Entscheidung.\"\n2. Unterlage geben: \"Ich schicke Ihnen die Rechnung mit der Ersparnis per WhatsApp.\"\n3. Risiko nehmen: \"Außerdem haben Sie 14 Tage Widerrufsrecht (§§ 312g, 355 BGB).\"\n4. Termin sichern: \"Wann ist Ihr Partner zu Hause? Ich komme gern noch einmal vorbei.\"\n\n💡 PROFI-TIPP: Nie ohne konkreten zweiten Termin gehen.",
    tags: ["partner",  "überlegen",  "widerruf",  "entscheidung",  "termin"],
  },
  {
    id: "ee6",
    category: "einwand",
    title: "Der Bonus ist doch nur ein Lockangebot",
    content:
      "🎁 EHRLICH BLEIBEN: Der Bonus gilt meist nur im ersten Jahr. Genau das offen sagen.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Transparent sein: \"Der Bonus ist ein Willkommensgeschenk für das erste Jahr.\"\n2. Ohne Bonus rechnen: Arbeits- und Grundpreis auch ab dem zweiten Jahr gegen den aktuellen Tarif stellen.\n3. Preisgarantie betonen: \"Der Preis ist für X Monate garantiert.\"\n4. Nachsorge versprechen: \"Vor Ende der Preisgarantie melde ich mich und wir schauen gemeinsam neu.\"\n\n💡 PROFI-TIPP: Wer ehrlich über den Bonus spricht, gewinnt Vertrauen und Weiterempfehlungen.",
    tags: ["bonus",  "lockangebot",  "neukundenbonus",  "zweites jahr",  "ehrlichkeit"],
  },
  {
    id: "ef1",
    category: "faq",
    title: "Wie läuft der Wechsel ab?",
    content:
      "🔄 ABLAUF IN 5 SCHRITTEN:\n1. Auftrag aufnehmen: Name, Adresse, Zählernummer, Zählerstand, alter Anbieter, IBAN\n2. Der neue Anbieter kündigt beim alten Anbieter\n3. Der neue Anbieter meldet den Wechsel beim Netzbetreiber an\n4. Der Kunde bekommt eine Bestätigung mit Lieferbeginn\n5. Am Stichtag Zählerstand ablesen, fertig\n\n⏱️ WANN GEHT ES LOS:\n• Aus der Grundversorgung: schnell, Kündigungsfrist nur 2 Wochen\n• Aus einem Sondervertrag: zum Vertragsende oder per Sonderkündigung\n\n💡 WICHTIG:\n• Der Kunde kündigt NICHT selbst\n• Keine Unterbrechung, kein Technikertermin",
    tags: ["ablauf",  "wechsel",  "dauer",  "lieferbeginn",  "kündigung"],
  },
  {
    id: "ef2",
    category: "faq",
    title: "Sonderkündigungsrecht bei Preiserhöhung",
    content:
      "📈 WAS GILT:\n• Erhöht der Anbieter die Preise, darf der Kunde ohne Frist zum Wirksamwerden der Änderung kündigen (§ 41 Abs. 5 EnWG)\n• Der Anbieter muss die Erhöhung vorher schriftlich ankündigen\n\n🔍 SO FINDEST DU ES:\n• Nach dem letzten Brief vom Versorger fragen (\"Preisanpassung\", \"Änderung Ihrer Preise\")\n• Datum der Änderung notieren, das ist der Kündigungstermin\n\n🎯 VERKAUFSARGUMENT:\n\"Ihr Anbieter hat erhöht. Sie dürfen jetzt sofort raus, ohne Laufzeit abzuwarten.\" ",
    tags: ["sonderkündigung",  "preiserhöhung",  "preisanpassung",  "kündigung",  "frist"],
  },
  {
    id: "ef3",
    category: "faq",
    title: "Grundversorgung - was ist das?",
    content:
      "🏠 GRUNDVERSORGUNG:\n• Der Standardtarif des größten Versorgers im Ort (oft die Stadtwerke)\n• Gilt automatisch, wenn jemand nie gewechselt hat oder nach einem Umzug nichts abgeschlossen hat\n• Meist deutlich teurer als Sondertarife\n\n📋 KÜNDIGUNG:\n• Jederzeit mit 2 Wochen Frist, in Textform, ohne Gebühren (§ 20 StromGVV / GasGVV)\n\n🎯 ERKENNEN:\n• Auf der Rechnung steht \"Grundversorgung\" oder \"Allgemeiner Tarif\"\n• Kunde wohnt lange dort und hat \"nie etwas gemacht\"\n\n💡 Das sind die einfachsten Abschlüsse: hohe Ersparnis, kurze Frist.",
    tags: ["grundversorgung",  "grundversorger",  "stadtwerke",  "standardtarif",  "ersparnis"],
  },
  {
    id: "ef4",
    category: "faq",
    title: "Abschlag und Jahresabrechnung",
    content:
      "💶 ABSCHLAG:\n• Monatliche Vorauszahlung auf den erwarteten Jahresverbrauch\n• Wird nach der Jahresabrechnung neu berechnet\n\n🧾 JAHRESABRECHNUNG:\n• Tatsächlicher Verbrauch minus gezahlte Abschläge\n• Ergebnis: Nachzahlung oder Guthaben\n\n🗣️ SO ERKLÄRST DU ES:\n\"Der Abschlag ist nur eine Vorauszahlung. Entscheidend ist der Preis pro kWh und der Grundpreis, und die sind bei uns günstiger.\"\n\n💡 Beim Wechsel erstellt der alte Anbieter eine Schlussrechnung. Guthaben wird ausgezahlt.",
    tags: ["abschlag",  "jahresabrechnung",  "nachzahlung",  "guthaben",  "schlussrechnung"],
  },
  {
    id: "ef5",
    category: "faq",
    title: "Welche Kündigungsfristen gelten?",
    content:
      "📋 ÜBERSICHT:\n• Grundversorgung: 2 Wochen, jederzeit\n• Sondervertrag in der Mindestlaufzeit: zum Ende der Laufzeit\n• Verträge ab 1. März 2022 nach der Mindestlaufzeit: monatlich kündbar (§ 309 Nr. 9 BGB)\n• Preiserhöhung: Sonderkündigung zum Änderungstermin\n\n💡 Im Zweifel einfach den Wechsel zum nächstmöglichen Termin eintragen. Der neue Anbieter prüft die Frist.",
    tags: ["kündigungsfrist",  "laufzeit",  "grundversorgung",  "sondervertrag",  "monatlich"],
  },
];
