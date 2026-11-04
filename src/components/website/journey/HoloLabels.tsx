import type { RefObject } from "react";
import type { AnchorKey } from "../../../lib/website/revier/revierEngine";
import { journeyLabels as L } from "../../../texts/websiteJourneyTexts";
import HoloLabel from "./HoloLabel";

/** Alle schwebenden Beschriftungen der Szene. Der 3D-Motor schiebt sie an ihren Platz und schaltet sie an und aus. */
interface HoloLabelsProps {
  labels: RefObject<Partial<Record<AnchorKey, HTMLElement | null>>>;
}

export default function HoloLabels({ labels }: HoloLabelsProps) {
  const bind = (key: AnchorKey) => (node: HTMLElement | null) => {
    if (labels.current) labels.current[key] = node;
  };
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <HoloLabel ref={bind("ownArea")} tone="#ef4444" title={L.ownArea} />
      <HoloLabel ref={bind("otherArea")} tone="#8b5cf6" title={L.otherArea} />
      <HoloLabel ref={bind("me")} tone="#ff4d4d" title={L.me} sub={L.meSub} />
      <HoloLabel ref={bind("walker")} tone="#22c55e" title={L.sale} sub={L.saleSub} />
      <HoloLabel ref={bind("coach")} tone="#c084fc" title="Enes" sub={L.coach} wide />
      <HoloLabel ref={bind("car")} tone="#5eead4" title={L.car} sub={L.carSub} />
      <HoloLabel ref={bind("shield")} tone="#34d399" title={L.shield} />
      <HoloLabel ref={bind("team0")} tone="#f59e0b" title={L.team[0] ?? ""} />
      <HoloLabel ref={bind("team1")} tone="#a855f7" title={L.team[1] ?? ""} />
      <HoloLabel ref={bind("team2")} tone="#a855f7" title={L.team[2] ?? ""} />
    </div>
  );
}
