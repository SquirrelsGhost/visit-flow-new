import { CloudOff, Loader2, MessageCircleHeart, Sparkles, Target, Trash2, Trophy, UserRound, type LucideIcon } from "lucide-react";
import type { CoachMemoryStatus } from "../../hooks/useCoachMemory";
import { groupMemories } from "../../lib/copilot/coachKnowledge";
import type { CoachMemory, CoachMemoryKind } from "../../lib/copilot/coachMemoryApi";
import type { GlassTone } from "../../lib/glass/glassTones";
import { coachMemoryTexts as t } from "../../texts/coachMemoryTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import { GLASS_ICON_BUTTON } from "../glass/glassStyles";

interface CoachMemoryListProps {
  status: CoachMemoryStatus;
  items: readonly CoachMemory[];
  onForget: (memory: CoachMemory) => void;
}

const LOOK: Record<CoachMemoryKind, [LucideIcon, GlassTone]> = {
  preference: [Sparkles, "purple"],
  fact: [UserRound, "blue"],
  win: [Trophy, "green"],
  weakspot: [Target, "orange"],
};

/** Erinnerungen von Enes nach Art, jede mit "Vergessen". Zeigt auch Laden, Funkloch und Demo. */
export default function CoachMemoryList({ status, items, onForget }: CoachMemoryListProps) {
  if (status !== "ready" || items.length === 0) {
    const [icon, tone, title, subtitle]: [LucideIcon, GlassTone, string, string | undefined] =
      status === "loading"
        ? [Loader2, "gray", t.loading, undefined]
        : status === "offline"
          ? [CloudOff, "gray", t.offline, t.offlineHint]
          : status === "demo"
            ? [MessageCircleHeart, "gray", t.demo, undefined]
            : [MessageCircleHeart, "purple", t.empty, t.emptyHint];
    return (
      <GlassSection label={t.memoryLabel}>
        <GlassRow icon={icon} tone={tone} title={title} subtitle={subtitle} />
      </GlassSection>
    );
  }
  const groups = groupMemories(items);
  return (
    <>
      {groups.map((group, index) => {
        const [icon, tone] = LOOK[group.kind];
        return (
          <GlassSection key={group.kind} label={t.kinds[group.kind]} footer={index === groups.length - 1 ? t.memoryFooter : undefined}>
            {group.items.map((memory) => (
              <GlassRow
                key={memory.id}
                icon={icon}
                tone={tone}
                title={memory.content}
                subtitle={`${t.source[memory.source]} · ${t.date(memory.createdAt)}`}
                trailing={
                  <button type="button" aria-label={`${t.forget}: ${memory.content}`} title={t.forget} onClick={() => onForget(memory)} className={GLASS_ICON_BUTTON}>
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </button>
                }
              />
            ))}
          </GlassSection>
        );
      })}
    </>
  );
}
