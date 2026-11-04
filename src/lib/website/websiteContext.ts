import { createContext, type RefObject } from "react";
import type { WebsiteTone } from "./websiteTones";

/** Gemeinsamer Zustand der Website: der Scroll-Container (die Seite scrollt in sich) und die aktuelle Farbstimmung. */
export interface WebsiteContextValue {
  scroller: RefObject<HTMLDivElement | null>;
  tone: WebsiteTone;
  setTone: (tone: WebsiteTone) => void;
}

export const WebsiteContext = createContext<WebsiteContextValue | null>(null);
