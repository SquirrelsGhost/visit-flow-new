import { Sparkles } from "lucide-react";
import { onboardingTexts as T } from "../../texts/onboardingTexts";

/** Kopf des Team-Buchens: Versprechen, Titel und kurzer Ablauf (v1). */
export interface OnboardingIntroProps { readonly _?: never; }

export default function OnboardingIntro() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-500/[0.08] via-orange-500/[0.04] to-transparent p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-red-500/10 blur-2xl animate-aurora"
      />
      <div className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-red-600 dark:text-red-400">
        <Sparkles className="h-4 w-4" strokeWidth={2} />
        {T.introBadge}
      </div>
      <h3 className="relative mt-1.5 text-lg font-extrabold tracking-tight text-foreground sm:text-xl">{T.introTitle}</h3>
      <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground">{T.introText}</p>
    </div>
  );
}
