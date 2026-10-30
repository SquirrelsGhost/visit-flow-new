/** Lichtstreif, der beim Erscheinen einmal über die Karte gleitet. Ohne Bewegungswunsch entfällt er. */
export interface GlassSheenProps { readonly _?: never; }

export default function GlassSheen() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span className="animate-glass-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </span>
  );
}
