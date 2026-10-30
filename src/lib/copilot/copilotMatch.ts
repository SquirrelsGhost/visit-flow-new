/** Kleinschreibung ohne Umlaute und Satzzeichen, damit "Aufträge" und "auftraege" gleich gelten. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9€%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set([
  "der", "die", "das", "und", "oder", "ein", "eine", "einen", "ich", "du", "er", "sie", "es", "wir", "ihr", "mir", "mich", "dir",
  "mein", "meine", "dein", "deine", "ist", "sind", "hat", "habe", "hast", "wie", "was", "wo", "wann", "warum", "mit", "fuer",
  "von", "zu", "zum", "zur", "auf", "aus", "bei", "den", "dem", "des", "nicht", "kein", "keine", "noch", "schon", "mal", "bitte",
  "kann", "kannst", "soll", "sagt", "sage", "kunde", "kundin", "enes", "hallo", "hey", "moin", "dass", "auch", "nur", "wenn",
]);

/** Bedeutungstragende Wörter einer Frage (ab 3 Zeichen, ohne Füllwörter). */
export function tokensOf(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

/** true, wenn ein Wort der Frage zum Stichwort passt; ab 5 Zeichen reicht der gemeinsame Anfang (Provision/Provisionen). */
export function wordHits(token: string, keyword: string): boolean {
  if (token === keyword) return true;
  const stem = Math.min(token.length, keyword.length, 5);
  return stem >= 5 && token.slice(0, stem) === keyword.slice(0, stem);
}

/** Zählt, wie viele Fragewörter in einem Text vorkommen. */
export function hitCount(tokens: readonly string[], haystack: string): number {
  const words = normalize(haystack).split(" ");
  return tokens.filter((token) => words.some((word) => wordHits(token, word))).length;
}
