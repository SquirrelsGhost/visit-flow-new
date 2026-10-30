import type { KnowledgeItem } from "./knowledgeTypes";

/** Verkaufsargumente, Texte wortgleich aus v1 (ai.kb.v1–v5 in de.json). */
export const KNOWLEDGE_VERKAUF: readonly KnowledgeItem[] = [
  {
    id: "v1",
    category: "verkauf",
    title: "GigaKombi - Der Familien-Spartrick",
    content:
      "💰 GIGAKOMBI - SO VERKAUFEN SIE ES RICHTIG:\n\n🎯 ERÖFFNUNG:\n\"Haben Sie auch Handyverträge in der Familie? Dann habe ich eine gute Nachricht für Sie!\"\n\n💶 KONKRETE RECHNUNG:\n• Pro Mobilfunkvertrag: 5€/Monat Rabatt\n• Familie mit 3 Handys: 15€/Monat = 360€ in 2 Jahren!\n• Familie mit 4 Handys: 20€/Monat = 480€ in 2 Jahren!\n\n📱 ZUSATZNUTZEN:\n• +5 GB extra Datenvolumen PRO Handy\n• Bevorzugter Kundenservice\n• Eine Rechnung für alles - übersichtlich!\n\n🎯 ABSCHLUSS-FRAGE:\n\"Wie viele Handyverträge haben Sie in der Familie? Ich rechne Ihnen aus, wie viel Sie sparen!\"\n\n💡 PROFI-TIPP: Immer konkret rechnen! \"Sie sparen 360€\" wirkt stärker als \"5€ pro Monat\".\n\n🎁 UPSELLING:\n\"Läuft Ihr Handyvertrag bald aus? Dann können wir gleich alles optimieren!\"",
    tags: ["gigakombi", "familie", "rabatt", "ersparnis", "verkaufsargument"],
  },
  {
    id: "v2",
    category: "verkauf",
    title: "Vodafone Netzqualität - Fakten statt Behauptungen",
    content:
      "🏆 NETZQUALITÄT - SO ARGUMENTIEREN SIE RICHTIG:\n\n📊 HARTE FAKTEN (Stand 2024):\n• Connect Testsieger: \"Sehr gut\" (Heft 01/2024)\n• 99,9% LTE-Abdeckung in Deutschland\n• 5G in über 90% der Fläche verfügbar\n• Schnellstes 5G-Netz Deutschlands (bis 1000 Mbit/s)\n• 2 Milliarden € Investition pro Jahr in Netzausbau\n\n📱 KONKRETE VORTEILE:\n• Überall erreichbar - auch auf dem Land\n• Schnelles Streaming ohne Ruckeln\n• Stabile Verbindung im Home Office\n• Zukunftssicher durch 5G-Ausbau\n\n🎯 VERKAUFSARGUMENT:\n\"Vodafone hat das beste Netz laut Connect. Das bedeutet für Sie: Überall schnelles Internet, keine Funklöcher, zukunftssicher durch 5G.\"\n\n💡 PROFI-TIPP: Nicht nur behaupten - Fakten nennen! \"Connect Testsieger\" überzeugt mehr als \"gutes Netz\".\n\n🎁 ZUSATZ:\n\"Und das Beste: Sie können es 30 Tage testen - bei Unzufriedenheit kostenfrei kündbar!\"",
    tags: ["netz", "qualität", "5g", "lte", "testsieger", "connect"],
  },
  {
    id: "v3",
    category: "verkauf",
    title: "Wechselservice - Wir machen alles!",
    content:
      "🔄 WECHSELSERVICE - DAS KILLER-ARGUMENT:\n\n😰 KUNDENANGST:\n\"Wechseln ist so kompliziert... Kündigung, Rufnummer, Installation...\"\n\n✅ IHRE ANTWORT:\n\"Genau deshalb übernehmen WIR alles für Sie! Sie müssen NICHTS tun.\"\n\n📋 WAS WIR ÜBERNEHMEN:\n1. ✅ Kündigung beim alten Anbieter\n2. ✅ Rufnummernmitnahme (Festnetz & Mobil)\n3. ✅ Termin mit Techniker vereinbaren\n4. ✅ Installation & Einrichtung vor Ort\n5. ✅ WLAN einrichten & testen\n6. ✅ Alle Geräte verbinden\n\n💰 KOSTEN: 0€ - Komplett kostenlos!\n\n⏱️ ZEITAUFWAND FÜR KUNDEN: 0 Minuten (außer Unterschrift)\n\n🎯 VERKAUFSARGUMENT:\n\"Sie unterschreiben heute - wir machen den Rest. In 2 Wochen haben Sie schnelleres Internet, ohne dass Sie einen Finger krümmen mussten!\"\n\n💡 PROFI-TIPP: Angst vor Aufwand ist oft größter Hinderungsgrund. Dieses Argument räumt ihn aus dem Weg!\n\n🎁 GARANTIE:\n\"30 Tage Zufriedenheitsgarantie - wenn Sie nicht zufrieden sind, machen wir den Wechsel rückgängig. Kostenlos!\"",
    tags: ["wechselservice", "service", "kündigung", "installation", "komfort"],
  },
  {
    id: "v4",
    category: "verkauf",
    title: "Vodafone Pass - Unbegrenztes Streaming",
    content:
      "📱 VODAFONE PASS - PERFEKT FÜR JUNGE ZIELGRUPPE:\n\n🎯 ZIELGRUPPE:\n• Jugendliche & junge Erwachsene (14-30 Jahre)\n• Viel-Streamer & Social-Media-Nutzer\n• Familien mit Kindern/Teenagern\n\n📦 VERFÜGBARE PÄSSE:\n• Social Pass (4,99€): WhatsApp, Facebook, Instagram, Twitter - OHNE Datenverbrauch\n• Video Pass (9,99€): Netflix, YouTube, Amazon Prime - OHNE Datenverbrauch\n• Music Pass (4,99€): Spotify, Apple Music, Deezer - OHNE Datenverbrauch\n• Chat Pass (2,99€): WhatsApp, Telegram, Threema - OHNE Datenverbrauch\n\n💡 VERKAUFSARGUMENT:\n\"Nutzen Sie viel Instagram oder Netflix? Dann ist der Vodafone Pass perfekt - streamen Sie unbegrenzt, ohne Ihr Datenvolumen zu verbrauchen!\"\n\n🎯 KONKRETE FRAGE:\n\"Was nutzen Sie am meisten auf dem Handy? Instagram? YouTube? Spotify?\"\n→ Dann passenden Pass empfehlen!\n\n💰 RECHNUNG:\n\"Ohne Pass: 10 GB Datenvolumen = 39,99€\nMit Pass: 5 GB Datenvolumen + Video Pass = 34,99€ + 9,99€ = 44,98€\n→ Unbegrenztes Streaming für nur 5€ mehr!\"\n\n💡 PROFI-TIPP: Besonders bei Familien mit Teenagern sehr erfolgreich!",
    tags: ["vodafone pass", "streaming", "social media", "datenvolumen", "netflix", "spotify"],
  },
  {
    id: "v5",
    category: "verkauf",
    title: "Zukunftssicherheit - Investition für 10+ Jahre",
    content:
      "🔮 ZUKUNFTSSICHERHEIT - LANGFRISTIGES ARGUMENT:\n\n🎯 ERÖFFNUNG:\n\"Internet wird immer wichtiger - heute und in Zukunft. Lassen Sie uns sicherstellen, dass Sie für die nächsten 10 Jahre gerüstet sind!\"\n\n📈 ENTWICKLUNG ZEIGEN:\n• Vor 10 Jahren: 16 Mbit/s waren \"schnell\"\n• Heute: 250 Mbit/s sind Standard\n• In 10 Jahren: 1000 Mbit/s werden Standard sein\n\n💡 KONKRETE BEISPIELE:\n• Home Office: Videokonferenzen in 4K\n• Smart Home: 20+ vernetzte Geräte\n• Streaming: Mehrere 4K/8K-Streams gleichzeitig\n• Gaming: Cloud-Gaming ohne Lags\n• VR/AR: Virtual Reality braucht hohe Bandbreite\n\n🎯 VERKAUFSARGUMENT:\n\"Für nur 5€ mehr im Monat bekommen Sie 1000 Mbit/s statt 250 Mbit/s - das ist Ihre Absicherung für die nächsten 10 Jahre!\"\n\n💰 RECHNUNG:\n\"5€ mehr pro Monat = 120€ pro Jahr. Dafür sind Sie für alle zukünftigen Entwicklungen gerüstet. Das ist eine Investition, keine Ausgabe!\"\n\n💡 PROFI-TIPP: Besonders bei technikaffinen Kunden und Familien mit Kindern sehr erfolgreich!",
    tags: ["zukunft", "investition", "geschwindigkeit", "smart home", "home office"],
  },
];
