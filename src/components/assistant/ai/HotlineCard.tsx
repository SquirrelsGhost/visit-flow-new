import { Phone } from "lucide-react";
import { useState } from "react";
import type { AssistantHotline } from "../../../lib/assistant/verticalAssistant";
import { assistantTexts as t } from "../../../texts/assistantTexts";
import SectionCard from "../SectionCard";
import HotlineNumber from "./HotlineNumber";
import HotlinePrepare from "./HotlinePrepare";
import IvrGuide from "./IvrGuide";

/** "Wichtige Hotlines" (v1 HotlineCard): Nummer zum Anrufen/Kopieren, Legitimation, Tastatur-Wegweiser. */
export interface HotlineCardProps { hotline: AssistantHotline }

export default function HotlineCard({ hotline }: HotlineCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <SectionCard icon={Phone} title={t.hotlinesTitle} tone="green">
      <HotlineNumber hotline={hotline} />
      <HotlinePrepare title={hotline.prepareTitle} options={hotline.prepare} />
      {hotline.hasIvr && <IvrGuide open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />}
    </SectionCard>
  );
}
