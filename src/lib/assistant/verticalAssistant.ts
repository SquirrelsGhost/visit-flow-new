import { BarChart3, Gavel, Landmark, MapPinned, ShieldCheck } from "lucide-react";
import type { Vertical } from "../battle/battleCategories";
import { ENERGY_KNOWLEDGE_A } from "./energyKnowledgeObjections";
import { ENERGY_KNOWLEDGE_B } from "./energyKnowledgeSales";
import { HOTLINE, PREPARE_OPTIONS, type PrepareOption } from "./hotline";
import { IMPORTANT_LINKS, MAX_VISIBLE_LINKS, type ImportantLink } from "./importantLinks";
import { KNOWLEDGE_ITEMS } from "./knowledgeBase";
import { SOLAR_KNOWLEDGE_A } from "./solarKnowledgeObjections";
import { SOLAR_KNOWLEDGE_B } from "./solarKnowledgeSales";
import { SOLAR_LEAD_CHECK, SOLAR_LINKS } from "./solarAssistant";
import type { KnowledgeItem } from "./knowledgeTypes";

/** Allgemeine Anlaufstellen für Strom & Gas, unabhängig vom Energiepartner. */
const ENERGY_LINKS: readonly ImportantLink[] = [
  { id: "en1", icon: MapPinned, title: "Netzbetreiber", description: "Zuständigen Netzbetreiber per Adresse finden", url: "https://www.vnbdigital.de/", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
  { id: "en2", icon: BarChart3, title: "Stromspiegel", description: "Verbrauch mit ähnlichen Haushalten vergleichen", url: "https://www.stromspiegel.de/", color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" },
  { id: "en3", icon: ShieldCheck, title: "Ratgeber", description: "Verbraucherzentrale: Wechsel, Kündigung & Widerruf", url: "https://www.verbraucherzentrale.de/", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
  { id: "en4", icon: Landmark, title: "BNetzA", description: "Bundesnetzagentur: Infos zu Strom & Gas", url: "https://www.bundesnetzagentur.de/", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" },
  { id: "en5", icon: Gavel, title: "Schlichtungsstelle Energie", description: "Wenn es mit dem Altversorger hakt", url: "https://www.schlichtungsstelle-energie.de/", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400" },
];

/** Was der Kunde für den Auftrag oder den Anruf beim Partner bereithalten sollte. */
const ENERGY_PREPARE: readonly PrepareOption[] = [
  { mark: "1", strong: "Zähler", rest: ": Zählernummer + aktueller Zählerstand (Foto)" },
  { mark: "2", strong: "Rechnung", rest: ": MaLo-ID, Jahresverbrauch in kWh, Altversorger + Kundennummer" },
  { mark: "3", strong: "Kunde", rest: ": Name, Geburtsdatum, Lieferadresse, IBAN" },
  { mark: "!", strong: "Ohne Rechnung:", rest: " Verbrauch schätzen (Wissensdatenbank → Technik) und im Auftrag vermerken", fallback: true },
];

export interface AssistantHotline {
  title: string;
  description: string;
  /** null, solange die Nummer des Energiepartners noch fehlt. */
  number: string | null;
  /** Überschrift der gelben Checkliste. */
  prepareTitle: string;
  prepare: readonly PrepareOption[];
  /** Tastatur-Wegweiser gibt es nur für die Vodafone-Händlerbetreuung. */
  hasIvr: boolean;
}

export interface AssistantContent {
  links: readonly ImportantLink[];
  defaultLinkIds: readonly string[];
  /** Eigener Speicher je Sparte, damit die Link-Auswahl beim Umschalten nicht verloren geht. */
  linksKey: string;
  hotline: AssistantHotline;
  knowledge: readonly KnowledgeItem[];
}

const firstIds = (links: readonly ImportantLink[]) => links.slice(0, MAX_VISIBLE_LINKS).map((l) => l.id);

const TELCO: AssistantContent = {
  links: IMPORTANT_LINKS,
  defaultLinkIds: firstIds(IMPORTANT_LINKS),
  linksKey: "dashboardSelectedLinks",
  hotline: { ...HOTLINE, prepareTitle: "📋 Vor dem Anruf bereithalten:", prepare: PREPARE_OPTIONS, hasIvr: true },
  knowledge: KNOWLEDGE_ITEMS,
};

const ENERGY: AssistantContent = {
  links: ENERGY_LINKS,
  defaultLinkIds: firstIds(ENERGY_LINKS),
  linksKey: "dashboardSelectedLinksEnergy",
  hotline: { title: "Partner-Hotline Energie", description: "Vertriebs-Support für Strom & Gas", number: null, prepareTitle: "📋 Für den Auftrag bereithalten:", prepare: ENERGY_PREPARE, hasIvr: false },
  knowledge: [...ENERGY_KNOWLEDGE_A, ...ENERGY_KNOWLEDGE_B],
};

const SOLAR: AssistantContent = {
  links: SOLAR_LINKS,
  defaultLinkIds: firstIds(SOLAR_LINKS),
  linksKey: "dashboardSelectedLinksSolar",
  hotline: { title: "Fachberater-Hotline", description: "Rückfragen zu Leads und Terminen", number: null, prepareTitle: "✅ Lead-Check vor dem Eintragen:", prepare: SOLAR_LEAD_CHECK, hasIvr: false },
  knowledge: [...SOLAR_KNOWLEDGE_A, ...SOLAR_KNOWLEDGE_B],
};

const BY_VERTICAL: Record<Vertical, AssistantContent> = { telco: TELCO, energy: ENERGY, solar: SOLAR };

/** Inhalte des KI-Reiters je Sparte: Telco wie v1, Energie und Lead (Solar) mit eigenen Links, Checklisten und Wissen. */
export function assistantContentFor(vertical: Vertical): AssistantContent {
  return BY_VERTICAL[vertical];
}
