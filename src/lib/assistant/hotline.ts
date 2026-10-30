/** Händlerbetreuung aus v1 (AITab/data/hotlines.tsx + HotlineCard.tsx). */
export const HOTLINE = {
  title: "Händlerbetreuung",
  description: "Support für Händler",
  number: "01721217212",
} as const;

export interface IvrNode {
  key: string;
  label: string;
  hint?: string;
  children?: readonly IvrNode[];
}

/** Tastatur-Menü der Hotline, Baum wie in v1. */
export const IVR_MENU: readonly IvrNode[] = [
  {
    key: "1",
    label: "Festnetz",
    children: [
      {
        key: "1",
        label: "Baden-Württemberg",
        children: [
          { key: "1", label: "Vertriebspartner Abteilung" },
          { key: "2", label: "Technik Abteilung" },
          { key: "3", label: "Winback Abteilung", hint: "⚠️ Kündigung muss vorher hinterlegt sein!" },
        ],
      },
    ],
  },
  {
    key: "2",
    label: "Mobilfunk Abteilung",
    children: [
      { key: "1", label: "Neuanschaltung" },
      { key: "2", label: "Bestandskunden" },
      { key: "3", label: "CallYa (SIM-Karten)" },
    ],
  },
  { key: "3", label: "DSL Abteilung" },
  { key: "4", label: "MHV Support" },
  { key: "5", label: "FamilyCard dazubuchen" },
];

export interface QuickPath {
  label: string;
  path: string;
  color: string;
}

/** Schnellwahl der meistgenutzten Abteilungen. */
export const QUICK_PATHS: readonly QuickPath[] = [
  { label: "Technik", path: "1 → 1 → 2", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  { label: "Vertriebspartner", path: "1 → 1 → 1", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { label: "Winback", path: "1 → 1 → 3", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
  { label: "Mobilfunk Neu", path: "2 → 1", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { label: "DSL", path: "3", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
];

export interface PrepareOption {
  mark: string;
  strong: string;
  rest: string;
  fallback?: boolean;
}

/** "Vor dem Anruf bereithalten" mit den drei Wegen zur Legitimation. */
export const PREPARE_OPTIONS: readonly PrepareOption[] = [
  { mark: "1", strong: "KDNR", rest: " + Geburtsdatum + Name + PLZ/Adresse" },
  { mark: "2", strong: "Name", rest: " + Servicepin + KDNR" },
  { mark: "!", strong: "Ohne KDNR:", rest: " Geburtsdatum + IBAN (letzte 4) + Adresse + Name", fallback: true },
];
