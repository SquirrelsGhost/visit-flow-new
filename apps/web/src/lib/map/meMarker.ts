/** Blauer Punkt mit Puls für den eigenen Standort (v1: .vf-me). Stile in styles/map.css. */
export function createMeMarkerElement(): HTMLElement {
  const root = document.createElement("div");
  root.className = "vf-me";
  const ping = document.createElement("div");
  ping.className = "vf-me-ping";
  const dot = document.createElement("div");
  dot.className = "vf-me-dot";
  root.append(ping, dot);
  return root;
}
