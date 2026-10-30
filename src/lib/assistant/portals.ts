import {
  BookOpen,
  Building2,
  Car,
  DollarSign,
  FileText,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Receipt,
  Smartphone,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export type PortalSectionId = "hauptsysteme" | "business-tools" | "weitere-services";

/** Wohin ein Portal führt: fremde Seite, Seite der App oder (noch nicht übernommener) Dialog aus v1. */
export type PortalAction = { kind: "external"; url: string } | { kind: "internal"; href: string } | { kind: "dialog" };

export interface Portal {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  action: PortalAction;
  badge?: string;
  maintenance?: boolean;
  /** Nur Telco: im Solar-Bereich ausgeblendet wie in v1. */
  telcoOnly?: boolean;
  /** Hinweis beim Antippen, solange ein Dialog oder Link noch fehlt. */
  pendingNote?: string;
}

export interface PortalSection {
  id: PortalSectionId;
  title: string;
  dot: string;
  portals: readonly Portal[];
}

/** Hervorgehobene Karte ganz oben (v1 FEATURED). */
export const FEATURED_PORTAL: Portal = {
  id: "d2d-center",
  title: "D2D Center",
  description: "Zentrales Management & Tracking für Ihre Vertriebsaktivitäten",
  icon: Building2,
  gradient: "from-emerald-500 via-green-500 to-teal-500",
  iconBg: "from-emerald-500 to-green-600",
  action: { kind: "external", url: "https://www.d2d-center.de/" },
  badge: "Empfohlen",
};

const dialog: PortalAction = { kind: "dialog" };

/** Abschnitte und Kacheln in der Reihenfolge aus v1 (D2DTab/data, nach order sortiert). */
export const PORTAL_SECTIONS: readonly PortalSection[] = [
  {
    id: "hauptsysteme",
    title: "Hauptsysteme",
    dot: "bg-blue-500",
    portals: [
      { id: "salesworld", title: "Salesworld", description: "Vodafone Sales Management Platform", icon: Globe, gradient: "from-blue-500 via-indigo-500 to-purple-500", iconBg: "from-blue-500 to-indigo-600", action: { kind: "external", url: "https://salesworld.vodafone.de/" } },
      { id: "mail", title: "Mail", description: "E-Mail & Kommunikation", icon: Mail, gradient: "from-violet-500 via-purple-500 to-fuchsia-500", iconBg: "from-violet-500 to-purple-600", action: { kind: "internal", href: "/webmail" } },
    ],
  },
  {
    id: "business-tools",
    title: "Business Tools",
    dot: "bg-orange-500",
    portals: [
      { id: "abrechnung", title: "Abrechnung", description: "Abrechnungen & Vergütungsübersicht", icon: Receipt, gradient: "from-lime-500 via-green-500 to-emerald-500", iconBg: "from-lime-500 to-green-600", action: { kind: "internal", href: "/abrechnung" } },
      { id: "bestandskunden", title: "Bestandskunden", description: "Kundendatenbank & Übersicht", icon: UserCheck, gradient: "from-blue-500 via-sky-500 to-cyan-500", iconBg: "from-blue-500 to-sky-600", action: dialog, telcoOnly: true },
      { id: "street-list", title: "Straßenliste", description: "Aktive Straßen und Zuweisungen", icon: MapPin, gradient: "from-blue-500 via-indigo-500 to-purple-500", iconBg: "from-blue-500 to-indigo-600", action: { kind: "internal", href: "/street-list" } },
      { id: "training", title: "Training", description: "Schulungen & Weiterbildung", icon: BookOpen, gradient: "from-indigo-500 via-blue-500 to-cyan-500", iconBg: "from-indigo-500 to-blue-600", action: dialog },
      { id: "follow-up", title: "Follow-Up", description: "Kunden-Nachrichten nach Sale", icon: MessageCircle, gradient: "from-green-500 via-emerald-500 to-teal-500", iconBg: "from-green-500 to-emerald-600", action: dialog, badge: "WhatsApp" },
      { id: "formular", title: "Formulare", description: "Wichtige Dokumente und Verträge", icon: FileText, gradient: "from-amber-500 via-orange-500 to-rose-500", iconBg: "from-amber-500 to-orange-600", action: dialog, telcoOnly: true },
      { id: "porting", title: "Portierung", description: "Rufnummern-Parkplatz", icon: Smartphone, gradient: "from-emerald-500 via-green-500 to-teal-500", iconBg: "from-emerald-500 to-green-600", action: dialog, telcoOnly: true },
    ],
  },
  {
    id: "weitere-services",
    title: "Weitere Services",
    dot: "bg-emerald-500",
    portals: [
      { id: "provisionen", title: "Provisionen", description: "Abrechnungen & Vergütungen", icon: DollarSign, gradient: "from-teal-500 via-emerald-500 to-green-500", iconBg: "from-teal-500 to-emerald-600", action: dialog, badge: "Neu" },
      { id: "aeltere-tarife", title: "Ältere Tarife", description: "Archiv & Legacy Tarife", icon: FileText, gradient: "from-slate-500 via-gray-500 to-zinc-500", iconBg: "from-slate-500 to-gray-600", action: dialog, telcoOnly: true },
      { id: "fahrtenbuch", title: "Fahrtenbuch", description: "Monatliche Fahrtaufzeichnung", icon: Car, gradient: "from-blue-500 via-cyan-500 to-sky-500", iconBg: "from-blue-500 to-cyan-600", action: { kind: "internal", href: "/fahrtenbuch" }, badge: "Neu" },
      { id: "routenplaner", title: "Routenplaner", description: "Routenoptimierung & Tourenplanung", icon: Navigation, gradient: "from-rose-500 via-pink-500 to-fuchsia-500", iconBg: "from-rose-500 to-pink-600", action: { kind: "internal", href: "/route" }, maintenance: true },
    ],
  },
];

/** Kacheln eines Abschnitts für den aktiven Bereich (Solar blendet die Telco-Werkzeuge aus). */
export function visiblePortals(section: PortalSection, isSolar: boolean): readonly Portal[] {
  return isSolar ? section.portals.filter((p) => !p.telcoOnly) : section.portals;
}

export interface PortalSet {
  featured: Portal;
  sections: readonly PortalSection[];
}

/** Telco und Solar teilen sich die Vodafone-Portale wie in v1; Solar ohne die Telco-Werkzeuge. */
export function telcoPortalSet(isSolar: boolean): PortalSet {
  return {
    featured: FEATURED_PORTAL,
    sections: PORTAL_SECTIONS.map((section) => ({ ...section, portals: visiblePortals(section, isSolar) })),
  };
}
