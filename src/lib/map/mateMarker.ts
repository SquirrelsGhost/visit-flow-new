import { mateColor } from "./mapTeam";

/** Tropfen-Pin mit Anfangsbuchstabe für einen Kollegen (v1: .vf-mate). Stile in styles/map.css. */
export function createMateMarkerElement(userId: string, name: string): HTMLElement {
  const root = document.createElement("div");
  root.className = "vf-mate";
  root.style.setProperty("--vf-mate-color", mateColor(userId));
  root.title = name;
  const letter = document.createElement("span");
  letter.className = "vf-mate-letter";
  letter.textContent = (name || "?").slice(0, 1).toUpperCase();
  root.append(letter);
  return root;
}

/** Popup-Inhalt "Kollege · Name" als DOM, damit Namen nie als HTML ausgewertet werden. */
export function createMatePopupContent(userId: string, name: string): HTMLElement {
  const root = document.createElement("div");
  root.className = "vf-mate-popup";
  const dot = document.createElement("span");
  dot.className = "vf-mate-popup-dot";
  dot.style.background = mateColor(userId);
  const text = document.createElement("div");
  const label = document.createElement("span");
  label.className = "vf-mate-popup-label";
  label.textContent = "Kollege";
  const value = document.createElement("span");
  value.className = "vf-mate-popup-name";
  value.textContent = name || "Unbekannt";
  text.append(label, value);
  root.append(dot, text);
  return root;
}
