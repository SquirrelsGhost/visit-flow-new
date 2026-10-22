// Setzt Hell/Dunkel schon vor dem ersten Zeichnen, damit die Seite nicht kurz hell aufblitzt.
try {
  if (localStorage.getItem("theme") === "dark") document.documentElement.classList.add("dark");
} catch {
  // ohne localStorage bleibt es hell
}
