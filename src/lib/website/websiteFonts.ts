import { Instrument_Serif, Inter_Tight } from "next/font/google";

/** Schriften der Website: kräftige Grotesk für Titel, kursive Serifenschrift für betonte Wörter. */
export const displayFont = Inter_Tight({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--vfw-display", display: "swap" });
export const accentFont = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--vfw-serif", display: "swap" });
