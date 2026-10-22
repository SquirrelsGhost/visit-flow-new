import { useState } from "react";
import type { ConsentChoice } from "@visit-flow/shared/consent";
import type { ConsentTexts } from "../../texts/consentTexts";
import ConsentButton from "./ConsentButton";
import ConsentCategory from "./ConsentCategory";

interface ConsentSettingsProps {
  texts: ConsentTexts;
  initial: ConsentChoice;
  consentId?: string;
  onSave: (choice: ConsentChoice) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

/** Feinauswahl je Kategorie. Auch hier stehen Ablehnen und Akzeptieren gleichwertig nebeneinander. */
export default function ConsentSettings({ texts, initial, consentId, onSave, onAcceptAll, onRejectAll }: ConsentSettingsProps) {
  const [choice, setChoice] = useState<ConsentChoice>(initial);

  return (
    <div className="space-y-3">
      <div className="max-h-[45dvh] space-y-3 overflow-y-auto pr-1">
        <ConsentCategory text={texts.necessary} active alwaysOnLabel={texts.alwaysOn} />
        <ConsentCategory
          text={texts.external}
          active={choice.extern}
          onChange={(extern) => setChoice((current) => ({ ...current, extern }))}
          alwaysOnLabel={texts.alwaysOn}
        />
      </div>
      {consentId && (
        <p className="font-mono text-[11px] text-ink-muted">
          {texts.consentId}: {consentId}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <ConsentButton label={texts.reject} onClick={onRejectAll} />
        <ConsentButton label={texts.save} onClick={() => onSave(choice)} />
        <ConsentButton label={texts.acceptAll} onClick={onAcceptAll} />
      </div>
    </div>
  );
}
