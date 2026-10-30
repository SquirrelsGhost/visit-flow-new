import { useState, type ReactNode } from "react";
import { useConsent } from "../../hooks/useConsent";
import { consentTexts } from "../../texts/consentTexts";
import ConsentButton from "./ConsentButton";

interface ExternalContentProps {
  /** Der eingebettete Inhalt (z. B. iframe). Wird erst nach Einwilligung gerendert. */
  children: ReactNode;
}

/**
 * Zwei-Klick-Lösung für Inhalte externer Anbieter. "Diesen Inhalt laden" gilt nur hier,
 * "immer erlauben" wird wie im Banner gespeichert. Bei Widerruf verschwindet der Inhalt sofort.
 */
export default function ExternalContent({ children }: ExternalContentProps) {
  const { consent, save } = useConsent();
  const [once, setOnce] = useState(false);

  if (once || consent?.choice.extern) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-ink-muted">
      <p>{consentTexts.externalNotice}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <ConsentButton label={consentTexts.loadOnce} onClick={() => setOnce(true)} />
        <ConsentButton label={consentTexts.allowAlways} onClick={() => save({ ...(consent?.choice ?? { extern: false }), extern: true }, "inhalt")} />
      </div>
    </div>
  );
}
