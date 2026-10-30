/** Eckpunkt zum Ziehen: 44 px Griff-Fläche für den Finger, sichtbar ist nur der Punkt. Stile in styles/map.css. */
export function createLassoVertex(index: number, selected: boolean, first: boolean): HTMLElement {
  const root = document.createElement("div");
  root.className = "vf-lasso-vertex";
  if (selected) root.classList.add("is-selected");
  if (first) root.classList.add("is-first");
  root.setAttribute("role", "button");
  root.setAttribute("aria-label", `Eckpunkt ${index + 1} verschieben`);
  const dot = document.createElement("span");
  dot.className = "vf-lasso-dot";
  root.append(dot);
  return root;
}

/** Zwischenpunkt auf einer Kante: antippen oder herausziehen fügt einen neuen Eckpunkt ein. */
export function createLassoMidpoint(index: number): HTMLElement {
  const root = document.createElement("div");
  root.className = "vf-lasso-mid";
  root.setAttribute("role", "button");
  root.setAttribute("aria-label", `Punkt zwischen ${index + 1} und ${index + 2} einfügen`);
  const dot = document.createElement("span");
  dot.className = "vf-lasso-mid-dot";
  dot.textContent = "+";
  root.append(dot);
  return root;
}
