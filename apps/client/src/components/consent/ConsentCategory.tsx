import type { ConsentCategoryText } from "../../texts/consentTexts";

interface ConsentCategoryProps {
  text: ConsentCategoryText;
  active: boolean;
  /** Fehlt bei "Notwendig": Der Schalter ist dann fest an. */
  onChange?: (active: boolean) => void;
  alwaysOnLabel: string;
}

const SWITCH_STYLES =
  "relative h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed";

/** Eine Kategorie mit Schalter und aufklappbaren Details. */
export default function ConsentCategory({ text, active, onChange, alwaysOnLabel }: ConsentCategoryProps) {
  const fixed = !onChange;
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-ink">{text.title}</p>
          <p className="mt-1 text-sm text-ink-muted">{text.text}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={text.title}
            disabled={fixed}
            onClick={() => onChange?.(!active)}
            className={`${SWITCH_STYLES} ${active ? "border-ink bg-ink" : "border-line bg-surface-muted"} ${fixed ? "opacity-60" : ""}`}
          >
            <span className={`absolute top-0.5 size-5.5 rounded-full bg-surface shadow transition-all ${active ? "left-[calc(100%-1.6rem)]" : "left-0.5"}`} />
          </button>
          {fixed && <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{alwaysOnLabel}</span>}
        </div>
      </div>
      <details className="mt-3 text-xs text-ink-muted">
        <summary className="cursor-pointer select-none">Details</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {text.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
