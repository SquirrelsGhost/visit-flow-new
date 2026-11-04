import { journeyLabels } from "../../../texts/websiteJourneyTexts";

/** Farben der Türen, genau wie auf der Karte in der App. */
export interface DoorLegendProps { readonly _?: never; }

export default function DoorLegend() {
  return (
    <ul className="mt-6 grid max-w-sm grid-cols-2 gap-x-6 gap-y-2.5 text-[14px] text-white/75">
      {journeyLabels.legend.map((item) => (
        <li key={item.label} className="flex items-center gap-2.5">
          <span className="size-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 12px ${item.color}` }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
