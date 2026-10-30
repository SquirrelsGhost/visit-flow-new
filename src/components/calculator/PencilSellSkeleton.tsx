/** Platzhalter, bis das gespeicherte Angebot im Browser geladen ist. */
export interface PencilSellSkeletonProps { readonly _?: never; }

export default function PencilSellSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4" aria-hidden="true">
      <div className="glass-surface h-24 animate-pulse rounded-[26px] motion-reduce:animate-none" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass-surface h-72 animate-pulse rounded-[26px] motion-reduce:animate-none" />
        <div className="glass-surface h-72 animate-pulse rounded-[26px] motion-reduce:animate-none" />
      </div>
    </div>
  );
}
