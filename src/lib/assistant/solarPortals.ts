import { CalendarCheck, ClipboardList, Sun, UserPlus } from "lucide-react";
import type { PortalSet } from "./portals";
import { ABRECHNUNG, dialog, FOLLOW_UP, MAIL, MORE_SERVICES, STREET_LIST, TRAINING } from "./sharedPortals";

/** Kacheln der Sparte Lead (Solar): Lead erfassen und verfolgen statt Salesworld und D2D Center. */
export const SOLAR_SET: PortalSet = {
  featured: {
    id: "lead-erfassen",
    title: "Lead erfassen",
    description: "Tür auf der Karte öffnen, Lead-Check ausfüllen und Termin eintragen",
    icon: UserPlus,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    iconBg: "from-emerald-500 to-teal-600",
    action: { kind: "internal", href: "/dashboard" },
    badge: "Direkt-Lead",
  },
  sections: [
    {
      id: "hauptsysteme",
      title: "Hauptsysteme",
      dot: "bg-emerald-500",
      portals: [
        { id: "lead-partnerportal", title: "Lead-Portal", description: "Leads an den Partner übergeben", icon: Sun, gradient: "from-yellow-400 via-amber-500 to-orange-500", iconBg: "from-yellow-400 to-amber-500", action: dialog, pendingNote: "Der Link zum Lead-Portal wird gerade hinterlegt." },
        MAIL,
      ],
    },
    {
      id: "business-tools",
      title: "Lead-Werkzeuge",
      dot: "bg-teal-500",
      portals: [
        { id: "lead-tracker", title: "Lead-Tracker", description: "Status deiner Leads: Termin, Angebot, Netto oder Storno", icon: ClipboardList, gradient: "from-emerald-500 via-green-500 to-lime-500", iconBg: "from-emerald-500 to-green-600", action: dialog, badge: "Neu", pendingNote: "Der Lead-Tracker kommt als Nächstes." },
        { id: "lead-termine", title: "Termine", description: "Beratungstermine der Fachberater im Blick", icon: CalendarCheck, gradient: "from-sky-500 via-blue-500 to-indigo-500", iconBg: "from-sky-500 to-blue-600", action: dialog, pendingNote: "Die Terminübersicht kommt als Nächstes." },
        STREET_LIST,
        ABRECHNUNG,
        TRAINING,
        FOLLOW_UP,
      ],
    },
    MORE_SERVICES,
  ],
};
