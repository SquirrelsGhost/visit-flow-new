/** Farbstimmung der Website: Der Hintergrund wechselt weich, sobald eine Szene in der Mitte steht. */
export type WebsiteTone = "brand" | "crm" | "ai" | "office" | "log";

export interface ToneColors {
  /** Zwei Lichter im Hintergrund */
  a: string;
  b: string;
  /** Akzent für Zahlen, Häkchen, Ränder */
  accent: string;
  /** Verlauf für Überschriften */
  text: string;
  /** Verlauf für Symbole und Knöpfe */
  fill: string;
}

export const TONES: Record<WebsiteTone, ToneColors> = {
  brand: {
    a: "rgba(220,38,38,0.55)",
    b: "rgba(109,40,217,0.45)",
    accent: "#fb7185",
    text: "linear-gradient(95deg,#ff6b6b,#f43f5e 45%,#c084fc)",
    fill: "linear-gradient(140deg,#fb7185,#dc2626)",
  },
  crm: {
    a: "rgba(220,38,38,0.55)",
    b: "rgba(190,24,93,0.45)",
    accent: "#fb7185",
    text: "linear-gradient(95deg,#ff6b6b,#f43f5e 50%,#e879f9)",
    fill: "linear-gradient(140deg,#fb7185,#dc2626)",
  },
  ai: {
    a: "rgba(168,85,247,0.5)",
    b: "rgba(79,70,229,0.5)",
    accent: "#c084fc",
    text: "linear-gradient(95deg,#f472b6,#a855f7 50%,#a5b4fc)",
    fill: "linear-gradient(140deg,#f472b6,#a855f7 50%,#6366f1)",
  },
  office: {
    a: "rgba(219,39,119,0.48)",
    b: "rgba(109,40,217,0.5)",
    accent: "#f9a8d4",
    text: "linear-gradient(95deg,#f9a8d4,#f472b6 45%,#c084fc)",
    fill: "linear-gradient(140deg,#f9a8d4,#db2777)",
  },
  log: {
    a: "rgba(13,148,136,0.5)",
    b: "rgba(37,99,235,0.45)",
    accent: "#5eead4",
    text: "linear-gradient(95deg,#5eead4,#38bdf8 55%,#a5b4fc)",
    fill: "linear-gradient(140deg,#5eead4,#0d9488)",
  },
};

export const TONE_KEYS = Object.keys(TONES) as WebsiteTone[];
