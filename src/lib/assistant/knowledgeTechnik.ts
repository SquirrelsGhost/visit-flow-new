import type { KnowledgeItem } from "./knowledgeTypes";

/** Technische Infos, Texte wortgleich aus v1 (ai.kb.t1–t6 in de.json). */
export const KNOWLEDGE_TECHNIK: readonly KnowledgeItem[] = [
  {
    id: "t1",
    category: "technik",
    title: "Verfügbarkeitsprüfung - So geht's richtig",
    content:
      "🔍 VERFÜGBARKEITSPRÜFUNG - SCHRITT FÜR SCHRITT:\n\n🌐 ONLINE PRÜFEN:\n1. vodafone.de/verfuegbarkeit aufrufen\n2. Adresse eingeben (Straße, Hausnummer, PLZ, Ort)\n3. Ergebnis zeigt: DSL, Kabel, Glasfaser, 5G\n\n📋 WAS WIRD GEPRÜFT:\n• Kabel-Internet: Hausanschluss vorhanden?\n• DSL: Entfernung zum Verteiler (max. 4 km für gute Geschwindigkeit)\n• Glasfaser: FTTH-Ausbau vorhanden?\n• 5G: Mobilfunk-Abdeckung\n\n⚠️ WICHTIG:\n• Immer EXAKTE Adresse eingeben (inkl. Hausnummer!)\n• Bei Mehrfamilienhäusern: Ggf. Wohnung angeben\n• Bei Neubau: Ggf. noch nicht im System → Techniker-Prüfung nötig\n\n🎯 VOR ORT PRÜFEN:\n• Kabel: Multimedia-Dose vorhanden? (runde Dose mit Schraubgewinde)\n• DSL: Telefondose vorhanden? (TAE-Dose)\n• Glasfaser: Glasfaser-Anschluss vorhanden? (ONT-Dose)\n\n💡 PROFI-TIPP: Immer VOR Vertragsabschluss prüfen! Sonst ggf. Probleme bei Installation.\n\n📞 BEI UNKLARHEITEN:\nTechnische Hotline: 0800 172 1212 (kostenlos)",
    tags: ["verfügbarkeit", "prüfung", "anschluss", "kabel", "dsl", "glasfaser"],
  },
  {
    id: "t2",
    category: "technik",
    title: "Installation Kabel-Internet - Ablauf & Dauer",
    content:
      "🔧 INSTALLATION KABEL-INTERNET - ALLE DETAILS:\n\n📋 VORAUSSETZUNGEN:\n• Multimedia-Dose vorhanden (runde Dose mit Schraubgewinde)\n• Zugang zur Wohnung\n• Personalausweis bereithalten\n• Ca. 60-90 Minuten Zeit einplanen\n\n👷 ABLAUF:\n1. Techniker prüft Multimedia-Dose\n2. Signalstärke wird gemessen\n3. Vodafone Station wird angeschlossen\n4. WLAN wird eingerichtet & optimiert\n5. Speedtest wird durchgeführt\n6. Kunde unterschreibt Installationsprotokoll\n\n⏱️ DAUER:\n• Standard-Installation: 60-90 Minuten\n• Bei Problemen: bis 2 Stunden\n• Termin-Fenster: 4 Stunden (z.B. 8-12 Uhr oder 13-17 Uhr)\n\n💰 KOSTEN:\n• In der Regel kostenlos (im Tarif enthalten)\n• Bei Sonderwünschen (z.B. zusätzliche Dosen): Ggf. Aufpreis\n\n📱 NACH INSTALLATION:\n• WLAN-Name & Passwort auf Router-Rückseite\n• Vodafone Station App installieren\n• Alle Geräte verbinden\n• Bei Problemen: 24/7 Hotline\n\n💡 WICHTIG: Techniker richtet alles ein - Kunde muss nichts tun!",
    tags: ["installation", "kabel", "techniker", "vodafone station", "ablauf"],
  },
  {
    id: "t3",
    category: "technik",
    title: "5G Mobilfunk - Alle technischen Details",
    content:
      "📡 5G MOBILFUNK - TECHNISCHE FAKTEN:\n\n🌐 VERFÜGBARKEIT:\n• 5G in allen Großstädten (>100.000 Einwohner)\n• 90% Flächenabdeckung in Deutschland\n• Ausbau läuft kontinuierlich weiter\n• Prüfung: vodafone.de/netzabdeckung\n\n⚡ GESCHWINDIGKEIT:\n• Download: bis 1000 Mbit/s (1 Gbit/s)\n• Upload: bis 100 Mbit/s\n• Latenz: unter 20ms (4G: 30-50ms)\n• Real: meist 200-500 Mbit/s (abhängig von Auslastung)\n\n📱 VORAUSSETZUNGEN:\n• 5G-fähiges Smartphone (z.B. iPhone 12+, Samsung S20+)\n• 5G-Tarif (nicht alle Tarife haben 5G!)\n• 5G-Abdeckung am Standort\n\n🎯 VORTEILE:\n• Extrem schnelles mobiles Internet\n• Ideal für Cloud-Gaming (Xbox Cloud, GeForce Now)\n• 4K-Streaming unterwegs ohne Ruckeln\n• Schnelle Downloads (1 GB Film in 8 Sekunden!)\n• Zukunftssicher\n\n💡 VERKAUFSARGUMENT:\n\"5G ist 10x schneller als 4G - perfekt für Streaming, Gaming und Home Office unterwegs!\"\n\n⚠️ WICHTIG:\n• 5G verbraucht mehr Akku als 4G\n• Nicht überall verfügbar - Gerät wechselt automatisch zu 4G\n• Kein Aufpreis bei den meisten Tarifen!",
    tags: ["5g", "mobilfunk", "geschwindigkeit", "lte", "netz", "technologie"],
  },
  {
    id: "t4",
    category: "technik",
    title: "WLAN Optimierung - Tipps für beste Leistung",
    content:
      "📶 WLAN OPTIMIERUNG - PROFI-TIPPS:\n\n📍 ROUTER-PLATZIERUNG:\n• ✅ Zentral in der Wohnung platzieren\n• ✅ Erhöht aufstellen (Regal, nicht Boden)\n• ✅ Freie Sicht - nicht hinter Möbeln\n• ❌ Nicht in Ecken oder Schränken\n• ❌ Nicht neben Mikrowelle oder Babyphone\n• ❌ Nicht im Keller (bei mehrstöckigem Haus)\n\n📡 FREQUENZEN RICHTIG NUTZEN:\n• 5 GHz: Schnell, kurze Reichweite → Für Geräte in Router-Nähe (TV, PC, Konsole)\n• 2,4 GHz: Langsamer, große Reichweite → Für Geräte weit weg (Smartphone, Tablet)\n• Moderne Router wählen automatisch beste Frequenz (Band Steering)\n\n🔧 OPTIMIERUNGEN:\n• WLAN-Kanal ändern (bei vielen Nachbar-WLANs)\n• Firmware aktuell halten (automatisch bei Vodafone Station)\n• Gastzugang für Besucher (schützt Hauptnetzwerk)\n• WLAN-Zeitschaltung (nachts aus = weniger Strahlung)\n\n📶 BEI GROSSEN WOHNUNGEN:\n• WLAN-Repeater: Reichweite erweitern (ab 29,99€)\n• Mesh-System: Mehrere Router vernetzen (ab 99,99€)\n• Powerline: Internet über Stromleitung (ab 49,99€)\n\n💡 VODAFONE STATION APP:\n• WLAN-Analyse & Optimierung\n• Geräte-Übersicht & Kontrolle\n• Gastzugang einrichten\n• Kindersicherung aktivieren\n\n🎯 VERKAUFSARGUMENT:\n\"Mit der Vodafone Station haben Sie optimales WLAN - und die App hilft Ihnen, es noch besser zu machen!\"",
    tags: ["wlan", "wifi", "optimierung", "reichweite", "router", "mesh", "repeater"],
  },
  {
    id: "t5",
    category: "technik",
    title: "Vodafone Station - Features & Funktionen",
    content:
      "🔧 VODAFONE STATION - ALLE FEATURES:\n\n📦 HARDWARE:\n• WLAN 6 (WiFi 6) - neuester Standard\n• Dual-Band (2,4 GHz + 5 GHz gleichzeitig)\n• 4x Gigabit-LAN-Ports (für Kabel-Verbindungen)\n• 2x Telefon-Anschlüsse (für Festnetz-Telefone)\n• USB-Port (für Drucker oder Festplatte)\n\n📱 VODAFONE STATION APP:\n• WLAN-Name & Passwort ändern\n• Gastzugang einrichten\n• Geräte-Übersicht (wer ist verbunden?)\n• Kindersicherung (Zeitlimits, Website-Filter)\n• WLAN-Analyse & Optimierung\n• Fernzugriff (auch von unterwegs)\n\n🔒 SICHERHEIT:\n• Automatische Sicherheitsupdates\n• Firewall integriert\n• WPA3-Verschlüsselung (sicherster Standard)\n• Virenschutz für alle Geräte\n\n🎯 BESONDERE FEATURES:\n• Band Steering: Automatische Frequenzwahl\n• Beamforming: WLAN-Signal gezielt zu Geräten\n• MU-MIMO: Mehrere Geräte gleichzeitig bedienen\n• Mesh-fähig: Mit Repeatern vernetzbar\n\n💰 WERT: 149€ (im Tarif kostenlos enthalten!)\n\n💡 VERKAUFSARGUMENT:\n\"Die Vodafone Station ist ein Premium-Router im Wert von 149€ - bei uns kostenlos inklusive!\"",
    tags: ["vodafone station", "router", "features", "wlan", "app", "sicherheit"],
  },
  {
    id: "t6",
    category: "technik",
    title: "Störungsbehebung - Erste Hilfe bei Problemen",
    content:
      "🆘 STÖRUNGSBEHEBUNG - SCHNELLE LÖSUNGEN:\n\n🔴 KEIN INTERNET:\n1. Router neu starten (Stecker ziehen, 30 Sek warten, wieder einstecken)\n2. Kabel prüfen (alle fest verbunden?)\n3. Vodafone Station App → Störungscheck\n4. Hotline: 0800 172 1212\n\n📶 LANGSAMES WLAN:\n1. Näher zum Router gehen (Reichweite?)\n2. Andere Geräte trennen (zu viele Geräte?)\n3. 5 GHz statt 2,4 GHz nutzen (schneller!)\n4. Router neu platzieren (zentral, erhöht)\n5. WLAN-Kanal ändern (Nachbar-WLANs stören?)\n\n📞 TELEFON FUNKTIONIERT NICHT:\n1. Telefon direkt an Router anschließen (nicht an TAE-Dose!)\n2. Richtigen Port nutzen (FON 1 oder FON 2)\n3. Telefon auf \"Ton\" statt \"Impuls\" stellen\n4. Router neu starten\n\n📺 TV RUCKELT:\n1. LAN-Kabel statt WLAN nutzen (stabiler!)\n2. Andere Geräte pausieren (Bandbreite frei machen)\n3. Router näher an TV platzieren\n4. GigaTV-Box neu starten\n\n💡 WICHTIGSTE REGEL:\nBei 80% aller Probleme hilft: Router neu starten!\n\n📞 SUPPORT:\n• Hotline: 0800 172 1212 (24/7 kostenlos)\n• Vodafone Station App → Support-Chat\n• MeinVodafone App → Störungscheck\n• vodafone.de/hilfe\n\n🎯 VERKAUFSARGUMENT:\n\"Bei Problemen haben Sie 24/7 Support - kostenlos und auf Deutsch!\"",
    tags: ["störung", "probleme", "support", "hilfe", "troubleshooting", "internet langsam"],
  },
];
