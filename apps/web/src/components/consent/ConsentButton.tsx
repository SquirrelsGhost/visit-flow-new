interface ConsentButtonProps {
  label: string;
  onClick: () => void;
}

// Alle Knöpfe sehen gleich aus: Ablehnen ist so leicht wie Akzeptieren (Gleichwertigkeit nach TDDDG, DSK und EDSA).
// Deshalb gibt es bewusst keine Variante, keine Farbe und kein className-Prop.
const BUTTON_STYLES =
  "inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function ConsentButton({ label, onClick }: ConsentButtonProps) {
  return (
    <button type="button" onClick={onClick} className={BUTTON_STYLES}>
      {label}
    </button>
  );
}
