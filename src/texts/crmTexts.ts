import type { Vertical } from "../lib/battle/battleCategories";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const days = (n: number) => plural(n, "Tag", "Tagen");

/** Texte der Aufträge-Seite. Grundlage ist v1 (pages/CRMPage.tsx, components/crm/SaleCard.tsx, crm.* in de.json). */
export const crmTexts = {
  title: "Aufträge",
  demoBadge: "Demo",
  thisMonth: (month: string) => `Diesen Monat · ${month}`,
  orders: { telco: "Sales", solar: "Leads", energy: "Verträge" } satisfies Record<Vertical, string>,
  orderOne: { telco: "Sale", solar: "Lead", energy: "Vertrag" } satisfies Record<Vertical, string>,
  stornos: "Stornos",
  open: "Offen",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  approved: "Approved",
  quote: "Stornoquote",
  quoteEmpty: "Noch keine Aufträge in diesem Monat",
  commission: "Provision",
  bonusOk: (limit: number, bonus: number) => `Unter ${limit} % · ${bonus} € Bonus hält`,
  bonusLost: (limit: number) => `Über ${limit} % · Bonus in Gefahr`,
  buffer: (n: number) => (n === 0 ? "Kein Storno mehr bis zur Grenze" : `Noch ${plural(n, "Storno", "Stornos")} bis zur Grenze`),
  recover: (n: number) => `Noch ${plural(n, "Sale", "Sales")} ohne Storno bis unter 15 %`,
  split: (stornos: number, total: number, orders: string) => `${plural(stornos, "Storno", "Stornos")} bei ${total} ${orders}`,
  contractMonth: (m: number) => `Vertragsmonat ${m}`,
  bonusFromMonth: "Stornoquoten-Bonus ab Monat 5",

  // Filter und Suche
  filterLabel: "Aufträge filtern",
  all: "Alle",
  search: "Kunde, Adresse oder Produkt",
  recent: { telco: "Aktuell · unter 14 Tagen", solar: "Aktuell · unter 7 Tagen", energy: "Aktuell · unter 14 Tagen" } satisfies Record<Vertical, string>,
  older: { telco: "Älter · ab 14 Tagen", solar: "Älter · ab 7 Tagen", energy: "Älter · ab 14 Tagen" } satisfies Record<Vertical, string>,
  noneRecent: "Keine aktuellen Aufträge",
  noneOlder: "Keine älteren Aufträge",
  noMatch: "Kein Auftrag passt zum Filter",
  loadError: "Aufträge konnten nicht geladen werden",
  updateError: "Fehler beim Aktualisieren",

  // Karte
  today: "Heute",
  daysAgo: (n: number) => `vor ${days(n)}`,
  untilCompletion: (n: number) => `Abschluss in ${plural(n, "Tag", "Tagen")}`,
  leadOpen: (n: number) => `Noch ${plural(n, "Tag", "Tage")} offen`,
  leadExpired: "Frist abgelaufen",
  noAddress: "Keine Adresse",
  createdOn: "Erstellt am",
  sold: "Verkauft",
  note: "Notiz",
  lostReason: "Stornogrund",
  expand: "Details zeigen",
  collapse: "Details schließen",
  productCount: (n: number) => plural(n, "Produkt", "Produkte"),

  // Aktionen (v1 Wischen + Menü)
  complete: "Abschließen",
  cancel: "Stornieren",
  discard: "Verwerfen",
  discardHint: "Verwerfen (ohne Quote)",
  cancelProduct: "Produkt stornieren",
  tooEarly: (n: number) => `Erst nach 14 Tagen abschließbar (noch ${plural(n, "Tag", "Tage")})`,
  swipeCancel: "Nach rechts: Storno (Quote)",
  swipeComplete: "Nach links: Abschließen (ab 14 Tagen)",
  swipeDiscard: "Verwerfen ohne Quote: Auftrag aufklappen",
  leadsInfo: "Leads werden nicht von Hand bearbeitet. Approved und Storniert kommen automatisch über Pipedrive.",

  // Dialoge
  cancelTitle: "Auftrag stornieren?",
  cancelBody: (name: string) => `Der Auftrag von „${name}“ wird storniert. Das zählt zur Stornoquote.`,
  cancelProductTitle: "Produkt stornieren?",
  cancelProductBody: (name: string) => `„${name}“ wird storniert. Das zählt zur Stornoquote.`,
  discardTitle: "Auftrag verwerfen?",
  discardBody: (name: string) => `Der Auftrag von „${name}“ wird gelöscht, z. B. bei einer Doppelerfassung. Das zählt nicht zur Quote und lässt sich nicht rückgängig machen.`,
  back: "Abbrechen",
  completedToast: "Als abgeschlossen markiert",
  cancelledToast: "Storniert (zählt zur Stornoquote)",
  productCancelledToast: "Produkt storniert (zählt zur Stornoquote)",
  discardedToast: "Verworfen (keine Auswirkung auf die Quote)",

  // Verknüpfungen
  links: "Weiter",
  toAbrechnung: "Abrechnung",
  toAbrechnungText: "Stornos aus der Partner-Abrechnung prüfen oder reklamieren",
  toSimulator: "Provisions-Simulator",
  toSimulatorText: "Was der Stornoquoten-Bonus diesen Monat bringt",
  toSimulatorOther: "Provision für weitere Abschlüsse durchrechnen",
  toProfile: "Profil",
  toProfileText: "Vertragsmonat und heutige Zahlen",
} as const;
