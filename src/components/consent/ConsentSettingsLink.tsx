import { CONSENT_OPEN_EVENT } from "@/shared/consent/consent";

interface ConsentSettingsLinkProps {
  label: string;
}

const LINK_STYLES = "cursor-pointer underline underline-offset-4 hover:text-ink";

/** Öffnet die Einwilligungs-Einstellungen von überall (Widerruf so einfach wie Erteilung, Art. 7 Abs. 3 DSGVO). */
export default function ConsentSettingsLink({ label }: ConsentSettingsLinkProps) {
  return (
    <button type="button" className={LINK_STYLES} onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}>
      {label}
    </button>
  );
}
