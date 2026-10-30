import { BellRing, CircleAlert, Crown, Gem, MousePointerClick, PanelBottomOpen, Swords, TrendingUp, Undo2, type LucideIcon } from "lucide-react";
import { useFeedbackPrefs } from "../../hooks/useFeedbackPrefs";
import type { GlassTone } from "../../lib/glass/glassTones";
import { feedback, type FeedbackSound } from "../../lib/feedback/feedback";
import { FEEDBACK_MOMENTS, feedbackTexts as t } from "../../texts/feedbackTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import GlassSheet from "../glass/GlassSheet";

interface FeedbackPreviewSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Symbol und Farbe je Moment in der Liste. */
const LOOK: Record<FeedbackSound, [LucideIcon, GlassTone]> = {
  sale: [Gem, "green"],
  win: [Crown, "amber"],
  levelUp: [TrendingUp, "purple"],
  challenge: [Swords, "red"],
  milestone: [Gem, "indigo"],
  success: [BellRing, "green"],
  copy: [BellRing, "blue"],
  storno: [Undo2, "orange"],
  warning: [CircleAlert, "amber"],
  error: [CircleAlert, "rose"],
  sheetOpen: [PanelBottomOpen, "blue"],
  sheetClose: [PanelBottomOpen, "gray"],
  toggleOn: [MousePointerClick, "green"],
  toggleOff: [MousePointerClick, "gray"],
  select: [MousePointerClick, "blue"],
  tap: [MousePointerClick, "gray"],
};

/** Vorhör-Liste: jeder Moment der App mit Klang, Haptik und (bei großen Momenten) Konfetti zum Antippen. */
export default function FeedbackPreviewSheet({ open, onClose }: FeedbackPreviewSheetProps) {
  const { prefs } = useFeedbackPrefs();
  return (
    <GlassSheet open={open} onClose={onClose} title={t.preview} subtitle={prefs.sound ? t.previewSubtitle : t.previewMuted}>
      <GlassSection>
        {FEEDBACK_MOMENTS.map(({ sound, title, where }) => {
          const [icon, tone] = LOOK[sound];
          return <GlassRow key={sound} icon={icon} tone={tone} title={title} subtitle={where} onClick={() => feedback(sound)} chevron={false} />;
        })}
      </GlassSection>
    </GlassSheet>
  );
}
