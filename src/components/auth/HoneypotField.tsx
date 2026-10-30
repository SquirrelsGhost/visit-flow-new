interface HoneypotFieldProps {
  name?: string;
}

/**
 * Unsichtbares Bot-Fangfeld (Honeypot). Echte Nutzer sehen es nie und füllen es nicht aus;
 * automatisierte Bots tragen dort Werte ein und werden vor jedem Passwort-Hash abgewiesen.
 */
export default function HoneypotField({ name = "website_url" }: HoneypotFieldProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0">
      <label htmlFor={name}>Website</label>
      <input id={name} name={name} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
