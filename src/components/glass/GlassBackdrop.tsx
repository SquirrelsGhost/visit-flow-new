/**
 * Hintergrund jeder Glas-Seite: ruhige Grundfarbe mit drei weichen Farblichtern, die kaum merklich treiben.
 * Nur Verläufe und transform, kein Filter: bleibt auch auf älteren Handys flüssig.
 */
export interface GlassBackdropProps { readonly _?: never; }

export default function GlassBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="glass-aurora animate-glass-drift absolute -inset-[15%]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.03]" />
    </div>
  );
}
