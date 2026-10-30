import { readPreference, writePreference } from "../preferences";

export type CopilotCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Gleicher Schlüssel wie v1, damit die gewohnte Ecke erhalten bleibt. */
const KEY = "ai_widget_pos";
const CORNERS: readonly CopilotCorner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

export const ORB_SIZE = { phone: 56, wide: 60 } as const;
const EDGE = { phone: 16, wide: 28 } as const;
/** Abstand zu Topbar und unterer Leiste. */
const GAP = 14;
/** Auf der Karte stehen rechts unten die Kartenknöpfe (Lasso, Stil, 3D, Standort): darüber ausweichen. */
const MAP_CONTROLS_CLEARANCE = 280;

export function readCorner(): CopilotCorner {
  const value = readPreference(KEY);
  return CORNERS.includes(value as CopilotCorner) ? (value as CopilotCorner) : "bottom-right";
}

export const saveCorner = (corner: CopilotCorner) => writePreference(KEY, corner);

/** Nächste Ecke zum Punkt, an dem der Knopf losgelassen wurde (v1 onDragEnd). */
export function cornerAt(x: number, y: number, width: number, height: number): CopilotCorner {
  return `${y < height / 2 ? "top" : "bottom"}-${x < width / 2 ? "left" : "right"}`;
}

/** Unterkante der Topbar und Oberkante der unteren Leiste, gemessen samt Safe-Area. */
function chrome(): { top: number; bottom: number } {
  const header = document.querySelector("header")?.getBoundingClientRect();
  // Die untere Leiste ist die tiefste Navigation auf der Seite
  const navTops = [...document.querySelectorAll("nav")].map((nav) => nav.getBoundingClientRect().top);
  const bottom = navTops.length > 0 ? Math.max(...navTops) : window.innerHeight - 64;
  return { top: header?.bottom ?? 80, bottom };
}

/** Bildschirmposition (links oben) des Knopfs für eine Ecke. */
export function cornerPoint(corner: CopilotCorner, onMap: boolean): { x: number; y: number } {
  const wide = window.innerWidth >= 768;
  const size = wide ? ORB_SIZE.wide : ORB_SIZE.phone;
  const edge = wide ? EDGE.wide : EDGE.phone;
  const { top, bottom } = chrome();
  const left = corner.endsWith("left");
  const lift = onMap && corner === "bottom-right" ? MAP_CONTROLS_CLEARANCE : 0;
  return {
    x: left ? edge : window.innerWidth - size - edge,
    y: corner.startsWith("top") ? top + GAP : bottom - size - GAP - lift,
  };
}
