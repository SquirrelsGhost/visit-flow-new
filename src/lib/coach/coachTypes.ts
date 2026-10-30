/** Eine eigene Tür der letzten Wochen, auf das reduziert, was der Coach braucht. */
export interface CoachDoor {
  at: number;
  /** Ohne Antwort an der Tür (N/A). */
  notMet: boolean;
  sold: boolean;
  appointment: boolean;
  noInterest: boolean;
  supplied: boolean;
  street: string;
  /** Produktgruppen der verkauften Produkte in der aktiven Sparte. */
  categories: readonly string[];
}

/** Zeitfenster mit der besten Antrefferquote. */
export interface CoachWindow {
  fromHour: number;
  toHour: number;
  hitRate: number;
  /** Durchschnitt aller Fenster zum Vergleich. */
  averageRate: number;
}

/** Woran es gerade am meisten hakt; bestimmt den Trainings-Fokus. */
export type CoachWeakSpot = "notMet" | "noInterest" | "supplied" | "closing" | null;

export interface CoachStreet {
  street: string;
  /** Offene Chancen: nicht angetroffen, Termin, bald frei werdende Verträge. */
  open: number;
}

/**
 * Coach-Profil eines Beraters aus seinen eigenen Türen (28 Tage), auf dem Gerät gerechnet.
 * Nur Kennzahlen gehen an den Server, Straßen bleiben lokal.
 */
export interface CoachProfile {
  doors: number;
  met: number;
  sales: number;
  /** Angetroffen je Tür in Prozent. */
  hitRate: number;
  /** Abschlüsse je angetroffener Tür in Prozent. */
  salesRate: number;
  /** Abschlüsse letzte 7 Tage minus die 7 Tage davor. */
  salesTrend: number;
  bestWindow: CoachWindow | null;
  weakSpot: CoachWeakSpot;
  topCategory: string | null;
  /** Gruppe, die im Mix fast fehlt (Cross-Sell-Chance). */
  rareCategory: string | null;
  streets: readonly CoachStreet[];
  /** Tage in Folge mit mindestens einer Tür bis heute. */
  streakDays: number;
  today: { doors: number; sales: number };
  /** Zu wenige Türen für belastbare Aussagen. */
  learning: boolean;
}
