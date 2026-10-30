import { BarChart3, Eraser } from "lucide-react";
import { useState } from "react";
import { useCoachMemory } from "../../hooks/useCoachMemory";
import { useCoachProfile } from "../../hooks/useCoachProfile";
import { coachFacts } from "../../lib/copilot/coachKnowledge";
import { coachMemoryTexts as t } from "../../texts/coachMemoryTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import GlassSheet from "../glass/GlassSheet";
import CoachMemoryList from "./CoachMemoryList";

interface CoachMemorySheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Was Enes über mich weiß": die Zahlen aus den eigenen Türen (auf dem Gerät gerechnet) und alles,
 * was Enes sich am Server gemerkt hat. Einzeln löschen oder mit zweimal Tippen alles vergessen.
 */
export default function CoachMemorySheet({ open, onClose }: CoachMemorySheetProps) {
  const { status, items, forget, forgetAll } = useCoachMemory(open);
  // Bei jedem Öffnen neu rechnen, damit die Türen von eben mitzählen
  const profile = useCoachProfile(open ? 1 : 0);
  const [confirming, setConfirming] = useState(false);

  const close = () => {
    setConfirming(false);
    onClose();
  };

  const eraseAll = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    void forgetAll();
  };

  return (
    <GlassSheet open={open} onClose={close} title={t.title} subtitle={t.subtitle}>
      <div className="space-y-7">
        {profile && (
          <GlassSection label={t.doorsLabel} footer={t.doorsFooter}>
            {coachFacts(profile).map((fact) => (
              <GlassRow key={fact.key} icon={BarChart3} tone="indigo" title={fact.label} value={fact.value} />
            ))}
          </GlassSection>
        )}
        <CoachMemoryList status={status} items={items} onForget={(memory) => void forget(memory)} />
        {status !== "demo" && (
          <GlassSection>
            <GlassRow
              icon={Eraser}
              tone="red"
              title={confirming ? t.forgetAllConfirm : t.forgetAll}
              subtitle={confirming ? t.forgetAllConfirmHint : t.forgetAllHint}
              warn={confirming}
              onClick={eraseAll}
              chevron={false}
            />
          </GlassSection>
        )}
      </div>
    </GlassSheet>
  );
}
