import { FileText, Package, Phone, PhoneCall, Scissors, type LucideIcon } from "lucide-react";

export interface ImportantLink {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  url: string;
  color: string;
}

/** Wie in v1 sind höchstens vier Links gleichzeitig sichtbar. */
export const MAX_VISIBLE_LINKS = 4;

/** Wichtige Links aus v1 (AITab/data/links.tsx, Texte aus de.json). */
export const IMPORTANT_LINKS: readonly ImportantLink[] = [
  {
    id: "l1",
    icon: FileText,
    title: "Formularcenter",
    description: "Alle wichtigen Formulare",
    url: "https://www.vodafone.de/hilfe/formularcenter.html",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    id: "l2",
    icon: PhoneCall,
    title: "Rufnummernportierung Kabel",
    description: "Festnetznummer mitnehmen",
    url: "https://www.vodafone.de/hilfe/formulare/8",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  },
  {
    id: "l3",
    icon: Scissors,
    title: "Kündigung",
    description: "Einfache Kündigung beim alten Anbieter",
    url: "https://www.vodafone.de/retoure/landing-page",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  },
  {
    id: "l4",
    icon: Phone,
    title: "Rufnummernmitnahme Handy",
    description: "Handynummer portieren",
    url: "https://www.vodafone.de/hilfe/rufnummernmitnahme-login.html",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  },
  {
    id: "l5",
    icon: Package,
    title: "Gerät zurücksenden",
    description: "Hardware Retoure (Kabel)",
    url: "https://www.vodafone.de/retoure/geraet-einsenden/kabel",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
  },
];

export const DEFAULT_LINK_IDS: readonly string[] = IMPORTANT_LINKS.slice(0, MAX_VISIBLE_LINKS).map((l) => l.id);
