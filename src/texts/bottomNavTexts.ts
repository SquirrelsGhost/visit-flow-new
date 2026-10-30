/** Texte zum Anpassen der unteren Leiste. */
export const bottomNavTexts = {
  sheetTitle: "Leiste anpassen",
  sheetSubtitle: "Tippe auf einen Platz und wähle, was dort stehen soll. Home in der Mitte bleibt fest.",
  slotsLabel: "Plätze",
  optionsLabel: "Seiten",
  slotNames: ["ganz links", "links", "rechts", "ganz rechts"],
  slotButton: (n: number, name: string, label: string) => `Platz ${n} (${name}): ${label}`,
  homeFixed: "Home, fest",
  current: "Steht hier",
  swapWith: (name: string) => `Tauscht mit Platz ${name}`,
  free: "Hierher legen",
  reset: "Zurücksetzen auf Standard",
  resetDone: "Standard wiederhergestellt",
  savedHint: "Deine Wahl wird in deinen Einstellungen gespeichert.",
  hint: "Tipp: Lange drücken zum Anpassen",
  hintClose: "Tipp schließen",
} as const;
