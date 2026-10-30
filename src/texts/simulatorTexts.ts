/** Texte des Provisions-Simulators. Grundlage ist v1 (components/calculator/ProvisionSimulator.tsx). */
export const simulatorTexts = {
  info: { telco: "Telco · Vodafone", lead: "Lead · TrioHeim", energy: "Energie · Strom & Gas" },
  demo: "Demo",
  energyPending: {
    title: "Provision für Strom & Gas folgt",
    body: "Sobald die Provisionstabelle deines Teams hinterlegt ist, rechnet der Simulator hier deine Strom- und Gas-Verträge live mit. Bis dahin steht die Energie-Provision wie in der Abrechnung auf 0 €.",
  },
  hero: {
    telco: "Geschätzte Provision",
    lead: "Erwartete Lead-Provision",
    energy: "Geschätzte Provision",
    empty: "Tippe unten auf einen Tarif, dann rechnet der Simulator live mit.",
    provision: "Provision",
    bonus: "Bonus",
    level: "inkl. {level}",
    units: { one: "1 Produkt", many: "{count} Produkte" },
    contracts: { one: "1 Vertrag", many: "{count} Verträge" },
    copy: "Kopieren",
    copied: "In die Zwischenablage kopiert",
    copyFailed: "Kopieren ist hier nicht möglich.",
    goal: "Als Ziel setzen",
    goalSaved: "Als Monatsziel gespeichert",
    total: "Gesamt",
  },
  month: {
    label: "Vertragsmonat",
    phases: { junior: "Junior", juniorPlus: "Junior Plus", regular: "Regulär" },
    footer: "Vorbelegt mit deinem Vodafone-Monat aus dem Profil. Die Bonus-Staffeln richten sich nach dem Monat.",
  },
  level: {
    label: "Berater-Level",
    names: { regulaer: "Regulär", professional: "Professional", expert: "Expert" },
    bonus: { regulaer: "", professional: "Professional +10 %", expert: "Expert +15 %" },
    storno: "Stornoquote ≤ 15 %",
    stornoText: "+750 € Bonus, wenn die Quote hält",
    quoteNow: "Deine Stornoquote",
    quoteValue: "{quote} % diesen Monat · in Aufträgen ansehen",
    quoteNone: "Noch keine Aufträge diesen Monat",
  },
  autopilot: {
    label: "Ziel-Autopilot",
    placeholder: "Ziel, z. B. 10000",
    aria: "Ziel-Umsatz in Euro",
    run: "Generieren",
    chip: "{k} Tsd. €",
    footer: {
      telco: "Füllt den Warenkorb, bis Provision und Bonus das Ziel erreichen: je vier Verträge drei Upsells und ein KIP, dazu GigaTV und Mobilfunk.",
      energy: "Füllt den Warenkorb mit dem stärksten Tarif, bis das Ziel erreicht ist.",
    },
    none: "Dafür fehlen passende Tarife.",
  },
  tariffs: {
    label: "Tarif hinzufügen",
    loading: "Tarife werden geladen …",
    empty: "Keine Tarife in dieser Kategorie",
    perMonth: "{price} mtl.",
    add: "{name} hinzufügen",
    footerTelco: "Zu jedem Neuvertrag legt der Simulator wie beim Verkauf TV Connect zuhause (KAS) dazu.",
    footerEnergy: "Provisionen aus der Tarifverwaltung.",
    footerDemo: "Demo-Tarife: Telco-Provisionen wie in v1, Strom und Gas geschätzt.",
  },
  basket: {
    label: "Warenkorb",
    empty: "Noch nichts ausgewählt",
    clear: "Leeren",
    less: "{name} eins weniger",
    more: "{name} eins mehr",
    remove: "{name} entfernen",
  },
  bonus: {
    label: "Bonus-Staffeln · Monat {month}",
    pieces: "{count} Stk.",
    perPiece: "{amount}/Stk.",
    stage: "S{stufe}: {target}",
    toNext: "Noch {count} bis Stufe {stufe}",
    top: "Höchste Stufe erreicht",
  },
  lead: {
    roleLabel: "Stufe",
    roles: { berater: "Berater", ausbilder: "Ausbilder", teamleiter: "Teamleiter", partner: "Partner" },
    roleHints: { berater: "angeh. Ausbilder", ausbilder: "ab 400 Teamleads", teamleiter: "ab 900 Teamleads", partner: "ab 1.300 Teamleads" },
    countOwn: "Netto-Leads im Monat",
    countTeam: "Netto-Teamleads im Monat",
    countAria: "Anzahl Netto-Leads",
    quick: { 150: "150 Nettos · 2× in Folge", 200: "200 Nettos · 1× im Monat" },
    formula: {
      berater: "{leads} Netto-Leads × {rate}",
      own: "{ownLeads} eigene Nettos × {ownRate}",
      overhead: "{teamLeads} Teamleads × {rate} Overhead",
      partner: "{teamLeads} Teamleads × {rate} Misch-Overhead",
    },
    bonusActive: "100-Nettos-Regel aktiv: +10 € rückwirkend",
    bonusMissing: "Noch {count} bis zur 100-Nettos-Regel",
    modelLabel: "Vergütungsmodell",
    rule: "Die 100-Nettos-Regel: Ab dem 100. Netto-Lead im Monat steigt dein Satz um 10 €, und zwar rückwirkend für alle Leads des Monats.",
    from100: "ab 100 Nettos",
    copyLine: "{count} {unit} ({role}) | Summe: {total}",
    unitOwn: "Netto-Leads",
    unitTeam: "Netto-Teamleads",
  },
  copyTitle: "Provisions-Simulation",
} as const;

export interface LeadModel {
  title: string;
  badge: string;
  text: string;
  note: string;
  rate: number;
}

/** Vergütungsmodell-Übersicht 1:1 aus v1 (Karten 01–04). */
export const LEAD_MODEL: Record<"berater" | "ausbilder" | "teamleiter" | "partner", LeadModel> = {
  berater: { title: "Berater", badge: "→ angehender Ausbilder", text: "Aufstieg: 2× 150 Nettos in Folge oder 1× 200 Nettos im Monat", note: "Probe: 10 Probetage → 400 Netto-Teamleads im Monat (im Team) · Ø 13.500 €", rate: 90 },
  ausbilder: { title: "Ausbilder", badge: "ab 400 Netto-Teamleads/Monat", text: "Vergütung: +10 € Overhead je Teammitglied · +10 € Provision", note: "Monatsziel: min. 100 eigene Nettos · Ø 14.000 €", rate: 100 },
  teamleiter: { title: "Teamleiter", badge: "ab 900 Teamleads", text: "Vergütung: +20 € Overhead je Mitarbeiter · 20 € je eigener Lead", note: "Monatsziel: min. 75 eigene Nettos · Fokus: Teamaufbau · Ø 25.000 €", rate: 110 },
  partner: { title: "Partner", badge: "ab 1.300 Netto-Teamleads", text: "Rolle: Key-Account-Manager · kein Klingeln mehr", note: "Vergütung: 10 € je Lead der betreuten Agenturen + eigenes Team · ab 30.000 €", rate: 120 },
};
