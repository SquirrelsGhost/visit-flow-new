import type { Ref } from "react";

/**
 * Beschriftung, die über einem Punkt im 3D-Viertel schwebt: Glasfläche mit farbigem Punkt und feiner Linie nach unten.
 * Sichtbarkeit kommt über data-on vom 3D-Motor, die Überblendung macht CSS.
 */
interface HoloLabelProps {
  ref: Ref<HTMLDivElement>;
  tone: string;
  title: string;
  sub?: string;
  wide?: boolean;
}

export default function HoloLabel({ ref, tone, title, sub, wide = false }: HoloLabelProps) {
  return (
    <div ref={ref} data-on="false" className="vfw-holo absolute left-0 top-0 will-change-transform">
      <div className="-translate-x-1/2 -translate-y-full pb-3">
        <div
          className={`vfw-bar relative isolate rounded-2xl px-3.5 py-2.5 text-left ${wide ? "w-[230px]" : "whitespace-nowrap"}`}
          style={{ boxShadow: `0 0 0 1px ${tone}55, 0 12px 40px -12px ${tone}` }}
        >
          <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
            <span className="size-2 rounded-full" style={{ background: tone, boxShadow: `0 0 10px ${tone}` }} />
            {title}
          </p>
          {sub && <p className="mt-0.5 text-[12px] leading-snug text-white/65">{sub}</p>}
        </div>
        <span className="mx-auto block h-3 w-px" style={{ background: `linear-gradient(${tone}, transparent)` }} />
      </div>
    </div>
  );
}
