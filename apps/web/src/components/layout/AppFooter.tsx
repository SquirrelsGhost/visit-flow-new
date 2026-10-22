import { consentTexts } from "../../texts/consentTexts";
import ConsentSettingsLink from "../consent/ConsentSettingsLink";

/** Rechtliche Links, auf jeder Seite erreichbar. */
export default function AppFooter() {
  return (
    <footer className="flex flex-wrap gap-4 px-4 py-6 text-xs text-ink-muted">
      <ConsentSettingsLink label={consentTexts.settingsLink} />
    </footer>
  );
}
