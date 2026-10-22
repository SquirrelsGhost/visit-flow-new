import { useEffect, useState } from "react";
import { ALL_CHOICE, CONSENT_OPEN_EVENT, NO_CHOICE, type ConsentChoice, type ConsentSource } from "@visit-flow/shared/consent";
import { useConsent } from "../../hooks/useConsent";
import { consentTexts } from "../../texts/consentTexts";
import ConsentButton from "./ConsentButton";
import ConsentSettings from "./ConsentSettings";

type View = "short" | "settings";

const WRAPPER_STYLES = "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5";
const CARD_STYLES = "pointer-events-auto w-full max-w-2xl rounded-3xl border border-line bg-surface p-5 shadow-xl sm:p-7";
const SIDE_BUTTON_STYLES = "shrink-0 cursor-pointer rounded-full px-3 py-1 text-sm text-ink-muted hover:text-ink";

/**
 * Einwilligungs-Banner nach § 25 TDDDG: erscheint, solange keine gültige Entscheidung vorliegt,
 * und jederzeit wieder über das Ereignis CONSENT_OPEN_EVENT (Link in Footer und Einstellungen).
 */
export default function ConsentBanner() {
  const { consent, save } = useConsent();
  const [opened, setOpened] = useState<View | null>(null);
  // true = über den Einstellungs-Link geöffnet (dann gibt es Schließen statt Zurück)
  const [viaLink, setViaLink] = useState(false);

  useEffect(() => {
    const open = () => {
      setViaLink(true);
      setOpened("settings");
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  const view: View | null = opened ?? (consent === null ? "short" : null);
  if (view === null) return null;

  const texts = consentTexts;
  const source: ConsentSource = viaLink ? "einstellungen" : "banner";
  const finish = (choice: ConsentChoice) => {
    save(choice, source);
    setOpened(null);
    setViaLink(false);
  };

  return (
    <div className={WRAPPER_STYLES}>
      <section role="dialog" aria-modal="false" aria-labelledby="consent-title" className={CARD_STYLES}>
        <div className="flex items-start justify-between gap-4">
          <h2 id="consent-title" className="text-xl font-bold text-ink">
            {texts.title}
          </h2>
          {view === "settings" && !viaLink && (
            <button type="button" onClick={() => setOpened("short")} className={SIDE_BUTTON_STYLES}>
              {texts.back}
            </button>
          )}
          {viaLink && consent && (
            <button type="button" onClick={() => (setOpened(null), setViaLink(false))} className={SIDE_BUTTON_STYLES} aria-label={texts.close}>
              ✕
            </button>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{texts.text}</p>
        <div className="mt-5">
          {view === "short" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <ConsentButton label={texts.reject} onClick={() => finish(NO_CHOICE)} />
              <ConsentButton label={texts.choose} onClick={() => setOpened("settings")} />
              <ConsentButton label={texts.acceptAll} onClick={() => finish(ALL_CHOICE)} />
            </div>
          ) : (
            <ConsentSettings
              texts={texts}
              initial={consent?.choice ?? NO_CHOICE}
              consentId={consent?.id}
              onSave={finish}
              onAcceptAll={() => finish(ALL_CHOICE)}
              onRejectAll={() => finish(NO_CHOICE)}
            />
          )}
        </div>
      </section>
    </div>
  );
}
