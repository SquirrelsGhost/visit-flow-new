import { GLASS_CARD, GLASS_DEEP } from "../glass/glassStyles";

/** Platzhalter beim ersten Laden in der echten Anordnung: Kopfkarte über beide Spalten, darunter zwei Spalten. */
export interface AdminSkeletonProps { readonly _?: never; }

export default function AdminSkeleton() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-xl space-y-7 px-4 pt-5 md:max-w-2xl md:px-6 lg:max-w-6xl lg:px-8">
      <div className={`${GLASS_DEEP} h-[15rem] animate-pulse`} />
      <div className="space-y-7 lg:grid lg:grid-cols-2 lg:gap-7 lg:space-y-0">
        <div className="space-y-7">
          <div className={`${GLASS_CARD} h-[17rem] animate-pulse`} />
          <div className={`${GLASS_CARD} h-[12rem] animate-pulse`} />
        </div>
        <div className="hidden space-y-7 lg:block">
          <div className={`${GLASS_CARD} h-[12rem] animate-pulse`} />
          <div className={`${GLASS_CARD} h-[17rem] animate-pulse`} />
        </div>
      </div>
    </div>
  );
}
