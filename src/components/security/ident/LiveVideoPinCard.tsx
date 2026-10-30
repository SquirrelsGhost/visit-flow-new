import { cn } from "@/lib/cn";
import { identWizardTexts } from "@/texts/identWizardTexts";

interface LiveVideoPinCardProps {
  fullName: string;
  spokenPin: string;
  /** Hebt die Karte hervor, sobald der Sprech-Schritt dran ist. */
  highlight: boolean;
}

/** Satz zum Vorlesen und der vierstellige Prüf-Code in großen Ziffern. */
export default function LiveVideoPinCard({ fullName, spokenPin, highlight }: LiveVideoPinCardProps) {
  return (
    <div className={cn("glass-surface rounded-[22px] p-4 transition-shadow duration-500 sm:flex sm:items-center sm:gap-5 lg:block", highlight && "shadow-[0_0_0_1.5px_rgba(239,68,68,0.55),0_18px_40px_-22px_rgba(239,68,68,0.7)]")}>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-[var(--glass-label)]">{identWizardTexts.videoReadAloud}</p>
        <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-foreground">{identWizardTexts.videoSentence(fullName, spokenPin)}</p>
      </div>
      <div className="mt-4 shrink-0 sm:mt-0 lg:mt-5">
        <p className="pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{identWizardTexts.videoPinLabel}</p>
        <div className="flex gap-1.5" aria-label={`${identWizardTexts.videoPinLabel}: ${spokenPin}`}>
          {spokenPin.split("").map((digit, i) => (
            <span key={i} aria-hidden className="flex h-12 w-10 items-center justify-center rounded-xl bg-[var(--glass-track)] font-mono text-[22px] font-bold text-foreground ring-1 ring-inset ring-[var(--glass-divider)]">
              {digit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
