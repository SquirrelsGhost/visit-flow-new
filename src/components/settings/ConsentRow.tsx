import { CONSENT_OPEN_EVENT } from "@/shared/consent/consent";
import { Cookie } from "lucide-react";
import { useConsent } from "../../hooks/useConsent";
import { cn } from "../../lib/cn";
import { settingsTexts } from "../../texts/settingsTexts";
import SettingsRow from "./SettingsRow";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

const CHIP = "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold";

/** Öffnet die Datenschutz-Einstellungen des Banners und zeigt rechts, was gerade gilt. */
export interface ConsentRowProps { readonly _?: never; }

export default function ConsentRow() {
  const { consent } = useConsent();
  const allowed = consent?.choice.extern === true;
  const label = !consent ? settingsTexts.consentNone : allowed ? settingsTexts.consentAllowed : settingsTexts.consentRejected;
  const chip = (
    <span className={cn(CHIP, allowed ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-slate-400/15 text-slate-600 dark:text-slate-300")}>{label}</span>
  );

  return (
    <SettingsRow
      icon={Cookie}
      tone="amber"
      title={settingsTexts.consentTitle}
      subtitle={consent ? settingsTexts.consentSince.replace("{date}", formatDate(consent.at)) : settingsTexts.consentOpen}
      trailing={chip}
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
    />
  );
}
