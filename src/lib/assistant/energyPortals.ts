import { Calculator, FileSignature, Flame } from "lucide-react";
import type { PortalSet } from "./portals";
import { ABRECHNUNG, dialog, FOLLOW_UP, MAIL, MORE_SERVICES, STREET_LIST, TRAINING } from "./sharedPortals";

/** Kacheln der Sparte Energie: Rechner, eigenes Partnerportal und Wechsel-Unterlagen statt Vodafone-Werkzeugen. */
export const ENERGY_SET: PortalSet = {
  featured: {
    id: "energie-rechner",
    title: "Energie-Rechner",
    description: "Strom & Gas vergleichen und die Ersparnis direkt am Küchentisch zeigen",
    icon: Calculator,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    iconBg: "from-amber-500 to-orange-600",
    action: { kind: "internal", href: "/statistics" },
    badge: "Pencil Sell",
  },
  sections: [
    {
      id: "hauptsysteme",
      title: "Hauptsysteme",
      dot: "bg-amber-500",
      portals: [
        { id: "energie-partnerportal", title: "Partnerportal", description: "Aufträge für Strom & Gas erfassen", icon: Flame, gradient: "from-amber-500 via-orange-500 to-red-500", iconBg: "from-amber-500 to-orange-600", action: dialog, pendingNote: "Der Link zum Energie-Partnerportal wird gerade hinterlegt." },
        MAIL,
      ],
    },
    {
      id: "business-tools",
      title: "Energie-Werkzeuge",
      dot: "bg-orange-500",
      portals: [
        ABRECHNUNG,
        { id: "wechsel-unterlagen", title: "Wechsel-Unterlagen", description: "Vollmacht, Zählerstand & Kündigung beim Altversorger", icon: FileSignature, gradient: "from-amber-500 via-yellow-500 to-orange-500", iconBg: "from-amber-500 to-yellow-600", action: dialog, badge: "Neu", pendingNote: "Die Wechsel-Unterlagen für Strom & Gas kommen als Nächstes." },
        STREET_LIST,
        TRAINING,
        FOLLOW_UP,
      ],
    },
    MORE_SERVICES,
  ],
};
