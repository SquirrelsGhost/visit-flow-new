import type { KnowledgeItem } from "./knowledgeTypes";

/** Häufige Fragen, Texte wortgleich aus v1 (ai.kb.f1–f6 in de.json). */
export const KNOWLEDGE_FAQ: readonly KnowledgeItem[] = [
  {
    id: "f1",
    category: "faq",
    title: "Rufnummernmitnahme - Wie funktioniert das?",
    content:
      "📞 RUFNUMMERNMITNAHME - ALLE INFOS:\n\n✅ WAS WIRD MITGENOMMEN:\n• Festnetz-Rufnummer (Ortsvorwahl + Nummer)\n• Mobilfunk-Rufnummer (0151, 0171, etc.)\n• Mehrere Rufnummern gleichzeitig möglich\n\n📋 VORAUSSETZUNGEN:\n• Rufnummer muss auf Ihren Namen laufen\n• Kündigungsfrist beim alten Anbieter beachten\n• Portierungserklärung unterschreiben\n\n⏱️ DAUER:\n• Festnetz: ca. 2-4 Wochen\n• Mobilfunk: ca. 1-2 Wochen\n• Wunschtermin möglich (z.B. zum Vertragsende)\n\n💰 KOSTEN:\n• Bei Vodafone: KOSTENLOS\n• Alter Anbieter darf max. 6,82€ berechnen (wird oft erlassen)\n\n🔄 ABLAUF:\n1. Vodafone-Vertrag abschließen\n2. Portierungserklärung unterschreiben\n3. Vodafone kümmert sich um alles\n4. Sie bekommen Termin-Bestätigung\n5. Am Stichtag: Rufnummer wechselt automatisch\n6. Keine Unterbrechung! (max. 1-2 Stunden)\n\n💡 WICHTIG:\n• NICHT selbst beim alten Anbieter kündigen (macht Vodafone!)\n• Vertragsdaten bereithalten (Kundennummer, Rufnummer)\n• Bei Mobilfunk: Auch während laufendem Vertrag möglich!\n\n🎯 VERKAUFSARGUMENT:\n\"Ihre Rufnummer behalten Sie - wir übernehmen alles, kostenlos!\"",
    tags: ["portierung", "rufnummer", "mitnahme", "mobilfunk", "festnetz"],
  },
  {
    id: "f2",
    category: "faq",
    title: "DSL vs. Kabel vs. Glasfaser - Was ist besser?",
    content:
      "🌐 TECHNOLOGIE-VERGLEICH - EINFACH ERKLÄRT:\n\n📡 DSL (Telefon-Leitung):\n• ✅ Überall verfügbar\n• ✅ Stabile Geschwindigkeit\n• ❌ Langsam (max. 250 Mbit/s, meist nur 50-100)\n• ❌ Abhängig von Entfernung zum Verteiler\n• 🎯 Für: Ländliche Gebiete, wenn nichts anderes verfügbar\n\n📺 KABEL (TV-Leitung):\n• ✅ Sehr schnell (bis 1000 Mbit/s)\n• ✅ Weit verbreitet\n• ✅ Gutes Preis-Leistungs-Verhältnis\n• ❌ Geschwindigkeit schwankt (bei vielen Nutzern)\n• 🎯 Für: Städte, Mehrfamilienhäuser, Normalnutzer\n\n💎 GLASFASER (Lichtleiter):\n• ✅ Extrem schnell (bis 10.000 Mbit/s)\n• ✅ Stabile Geschwindigkeit (keine Schwankungen)\n• ✅ Zukunftssicher\n• ✅ Symmetrisch (Upload = Download)\n• ❌ Noch nicht überall verfügbar\n• ❌ Teurer\n• 🎯 Für: Neubaugebiete, Power-User, Home Office\n\n📊 EMPFEHLUNG:\n1. Glasfaser (wenn verfügbar) → Beste Wahl!\n2. Kabel → Gute Wahl für die meisten\n3. DSL → Nur wenn nichts anderes verfügbar\n\n💡 VERKAUFSARGUMENT:\n\"Kabel ist der beste Kompromiss: Schnell, günstig, überall verfügbar!\"",
    tags: ["dsl", "kabel", "glasfaser", "internet", "technologie", "unterschied"],
  },
  {
    id: "f3",
    category: "faq",
    title: "Welchen Router bekomme ich?",
    content:
      "🔧 ROUTER-ÜBERSICHT - WAS SIE BEKOMMEN:\n\n📦 VODAFONE STATION (Standard):\n• WLAN 6 (WiFi 6) - neuester Standard\n• Bis 1000 Mbit/s WLAN-Geschwindigkeit\n• 4x LAN-Ports, 2x Telefon-Ports\n• Vodafone Station App (Fernsteuerung)\n• Wert: 149€ → Bei uns KOSTENLOS!\n\n📦 FRITZBOX (Alternative):\n• Auf Wunsch statt Vodafone Station\n• Bekannte Benutzeroberfläche\n• Viele Zusatzfunktionen\n• Ggf. Aufpreis (je nach Tarif)\n\n🆚 VERGLEICH:\n• Vodafone Station: Einfacher, moderner, App-Steuerung\n• FritzBox: Mehr Funktionen, komplexer, für Power-User\n\n💰 KOSTEN:\n• Vodafone Station: KOSTENLOS (im Tarif enthalten)\n• FritzBox: Ggf. 2,99€/Monat Aufpreis\n• Kauf statt Miete: Einmalig 149€ (Vodafone Station)\n\n🔄 EIGENER ROUTER:\n• Ja, Sie können auch Ihren eigenen Router nutzen\n• Zugangsdaten werden bereitgestellt\n• Kein Support bei Problemen!\n• Nicht empfohlen (außer Sie sind Profi)\n\n💡 VERKAUFSARGUMENT:\n\"Die Vodafone Station ist ein Premium-Router im Wert von 149€ - bei uns kostenlos inklusive!\"\n\n🎯 EMPFEHLUNG:\nVodafone Station nehmen - kostenlos, modern, einfach!",
    tags: ["router", "hardware", "eigenes gerät", "fritzbox", "vodafone station"],
  },
  {
    id: "f4",
    category: "faq",
    title: "Was passiert bei Umzug?",
    content:
      "🏠 UMZUG - ALLE WICHTIGEN INFOS:\n\n📋 MELDUNG:\n• Mindestens 4 Wochen vorher bei Vodafone melden\n• Online: MeinVodafone App oder vodafone.de\n• Hotline: 0800 172 1212\n• Neue Adresse angeben\n\n🔍 VERFÜGBARKEITSPRÜFUNG:\n• Vodafone prüft: Ist Tarif an neuer Adresse verfügbar?\n• JA → Umzug kostenlos, Vertrag läuft weiter\n• NEIN → Sonderkündigungsrecht (3 Monate Kündigungsfrist)\n\n💰 KOSTEN:\n• Umzug innerhalb Deutschland: KOSTENLOS\n• Techniker-Termin (falls nötig): KOSTENLOS\n• Neue Hardware (falls nötig): KOSTENLOS\n\n⏱️ ABLAUF:\n1. Umzug bei Vodafone melden (4 Wochen vorher)\n2. Verfügbarkeit wird geprüft\n3. Techniker-Termin wird vereinbart\n4. Am Umzugstag: Techniker installiert alles\n5. Alte Adresse wird abgemeldet\n\n🎯 SONDERKÜNDIGUNGSRECHT:\n• Wenn Tarif an neuer Adresse nicht verfügbar\n• 3 Monate Kündigungsfrist ab Umzugsdatum\n• Keine Kosten, keine Strafen\n\n💡 VERKAUFSARGUMENT:\n\"Bei Umzug nehmen Sie Ihren Vertrag einfach mit - kostenlos! Und falls es nicht verfügbar ist, können Sie kostenfrei kündigen.\"\n\n⚠️ WICHTIG:\nFrühzeitig melden! Sonst ggf. Unterbrechung der Versorgung.",
    tags: ["umzug", "wohnungswechsel", "adressänderung", "umzugsservice"],
  },
  {
    id: "f5",
    category: "faq",
    title: "GigaKombi - Welche Vorteile habe ich?",
    content:
      "💰 GIGAKOMBI - ALLE VORTEILE IM DETAIL:\n\n📱 RABATT:\n• Pro Mobilfunkvertrag: 5€/Monat Rabatt auf Festnetz\n• Oder: 5€/Monat Rabatt auf Mobilfunk (Sie wählen!)\n• Mehrere Handys: Mehrfach Rabatt! (z.B. 3 Handys = 15€/Monat)\n• Gilt für alle Vodafone-Mobilfunkverträge im Haushalt\n\n📊 BEISPIEL-RECHNUNG:\n• Festnetz: 44,99€/Monat (250 Mbit/s)\n• 2 Handyverträge: je 29,99€/Monat\n• OHNE GigaKombi: 104,97€/Monat\n• MIT GigaKombi: 94,97€/Monat (10€ gespart!)\n• Ersparnis in 2 Jahren: 240€!\n\n🎁 ZUSATZNUTZEN:\n• +5 GB extra Datenvolumen PRO Mobilfunkvertrag\n• Bevorzugter Kundenservice (kürzere Wartezeiten)\n• Eine Rechnung für alles (übersichtlich!)\n• Einfache Verwaltung in MeinVodafone App\n\n📋 VORAUSSETZUNGEN:\n• Vodafone Festnetz (Kabel, DSL oder Glasfaser)\n• Vodafone Mobilfunk (Vertrag, nicht Prepaid)\n• Beide auf gleichen Namen oder im gleichen Haushalt\n\n🔄 AKTIVIERUNG:\n• Automatisch, wenn beide Verträge vorhanden\n• Oder: In MeinVodafone App aktivieren\n• Oder: Hotline anrufen: 0800 172 1212\n\n💡 VERKAUFSARGUMENT:\n\"Mit GigaKombi sparen Sie 5€ pro Handy - bei 3 Handys sind das 360€ in 2 Jahren! Plus 5 GB extra Datenvolumen pro Handy!\"\n\n🎯 UPSELLING:\n\"Läuft Ihr Handyvertrag bald aus? Dann optimieren wir gleich alles zusammen!\"",
    tags: ["gigakombi", "kombi", "rabatt", "familie", "ersparnis", "mobilfunk"],
  },
  {
    id: "f6",
    category: "faq",
    title: "Grundgebühr vs. Gesamtkosten - Was zahle ich wirklich?",
    content:
      "💰 KOSTEN-TRANSPARENZ - EHRLICHE RECHNUNG:\n\n📋 GRUNDGEBÜHR (Monatlich):\n• Das ist der reine Tarifpreis\n• Z.B. 44,99€/Monat für 250 Mbit/s\n• Oft mit Rabatt in ersten Monaten (z.B. 6 Monate 19,99€)\n\n➕ ZUSATZKOSTEN (Einmalig):\n• Bereitstellung: 0€ (bei uns kostenlos!)\n• Versand Router: 0€ (bei uns kostenlos!)\n• Installation: 0€ (bei uns kostenlos!)\n• Anschlussgebühr: 0€ (bei uns kostenlos!)\n\n➕ ZUSATZKOSTEN (Optional):\n• Premium-Router: +2,99€/Monat (optional)\n• Zusätzliche Rufnummer: +5€/Monat (optional)\n• GigaTV: +9,99€/Monat (optional)\n• Vodafone Pass: +4,99-9,99€/Monat (optional)\n\n📊 BEISPIEL-RECHNUNG (24 Monate):\n• Monate 1-6: 19,99€/Monat = 119,94€\n• Monate 7-24: 44,99€/Monat = 809,82€\n• Gesamt 24 Monate: 929,76€\n• Pro Monat durchschnittlich: 38,74€\n\n💡 WICHTIG:\n• Keine versteckten Kosten!\n• Keine Preiserhöhungen während Vertragslaufzeit\n• Alle Kosten transparent in Vertragsunterlagen\n\n🎯 VERKAUFSARGUMENT:\n\"Bei uns zahlen Sie nur die Grundgebühr - keine Anschlussgebühr, keine Versandkosten, keine Installation. Alles inklusive!\"\n\n⚠️ EHRLICHKEIT:\nImmer Gesamtkosten über 24 Monate rechnen, nicht nur Aktionspreis!",
    tags: ["grundgebühr", "kosten", "flatrate", "leistungen", "preis"],
  },
];
