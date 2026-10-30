/** Schwebende Funken und ein langsamer Glanzstreifen über der Kopfkarte. Rein dekorativ, bei reduzierter Bewegung still. */
const PARTICLES = [
  "top-16 left-[12%] h-1.5 w-1.5 bg-rose-300/60 [animation-delay:0s]",
  "top-24 right-[14%] h-1 w-1 bg-sky-300/60 [animation-delay:0.7s]",
  "bottom-16 left-[22%] h-1 w-1 bg-amber-200/50 [animation-delay:1.4s]",
  "bottom-10 right-[26%] h-1.5 w-1.5 bg-amber-300/40 [animation-delay:2.1s]",
  "top-1/2 left-1/2 h-1 w-1 bg-white/40 [animation-delay:2.8s]",
] as const;

export interface HeroParticlesProps { readonly _?: never; }

export default function HeroParticles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="arena-shimmer absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      {PARTICLES.map((p) => (
        <span key={p} className={`arena-particle absolute rounded-full ${p}`} />
      ))}
    </div>
  );
}
