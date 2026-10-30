import { BookOpen, Car, DollarSign, Mail, MapPin, MessageCircle, Navigation, Receipt } from "lucide-react";
import type { Portal, PortalAction, PortalSection } from "./portals";

/** Kacheln, die Energie und Lead (Solar) gleich aus den Telco-Portalen übernehmen. */
export const dialog: PortalAction = { kind: "dialog" };

export const MAIL: Portal = { id: "mail", title: "Mail", description: "E-Mail & Kommunikation", icon: Mail, gradient: "from-violet-500 via-purple-500 to-fuchsia-500", iconBg: "from-violet-500 to-purple-600", action: { kind: "internal", href: "/webmail" } };
export const ABRECHNUNG: Portal = { id: "abrechnung", title: "Abrechnung", description: "Abrechnungen & Vergütungsübersicht", icon: Receipt, gradient: "from-lime-500 via-green-500 to-emerald-500", iconBg: "from-lime-500 to-green-600", action: { kind: "internal", href: "/abrechnung" } };
export const STREET_LIST: Portal = { id: "street-list", title: "Straßenliste", description: "Aktive Straßen und Zuweisungen", icon: MapPin, gradient: "from-blue-500 via-indigo-500 to-purple-500", iconBg: "from-blue-500 to-indigo-600", action: { kind: "internal", href: "/street-list" } };
export const TRAINING: Portal = { id: "training", title: "Training", description: "Schulungen & Weiterbildung", icon: BookOpen, gradient: "from-indigo-500 via-blue-500 to-cyan-500", iconBg: "from-indigo-500 to-blue-600", action: dialog };
export const FOLLOW_UP: Portal = { id: "follow-up", title: "Follow-Up", description: "Kunden-Nachrichten nach Sale", icon: MessageCircle, gradient: "from-green-500 via-emerald-500 to-teal-500", iconBg: "from-green-500 to-emerald-600", action: dialog, badge: "WhatsApp" };

export const MORE_SERVICES: PortalSection = {
  id: "weitere-services",
  title: "Weitere Services",
  dot: "bg-emerald-500",
  portals: [
    { id: "provisionen", title: "Provisionen", description: "Abrechnungen & Vergütungen", icon: DollarSign, gradient: "from-teal-500 via-emerald-500 to-green-500", iconBg: "from-teal-500 to-emerald-600", action: dialog },
    { id: "fahrtenbuch", title: "Fahrtenbuch", description: "Monatliche Fahrtaufzeichnung", icon: Car, gradient: "from-blue-500 via-cyan-500 to-sky-500", iconBg: "from-blue-500 to-cyan-600", action: { kind: "internal", href: "/fahrtenbuch" } },
    { id: "routenplaner", title: "Routenplaner", description: "Routenoptimierung & Tourenplanung", icon: Navigation, gradient: "from-rose-500 via-pink-500 to-fuchsia-500", iconBg: "from-rose-500 to-pink-600", action: { kind: "internal", href: "/route" }, maintenance: true },
  ],
};
