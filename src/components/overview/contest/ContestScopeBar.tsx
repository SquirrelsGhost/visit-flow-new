import { Briefcase, GraduationCap, Trophy } from "lucide-react";
import type { ContestScope } from "../../../lib/overview/contestTypes";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassSegmented from "../../glass/GlassSegmented";

interface ContestScopeBarProps {
  scopes: readonly ContestScope[];
  active: ContestScope;
  onChange: (scope: ContestScope) => void;
}

const ICONS = { team: Trophy, strukturleiter: Briefcase, mentor: GraduationCap } as const;
const texts = overviewTexts.contest;

/** Bereiche der Gewinnspiele (Haupt, Strukturleiter, Mentor); nur sichtbar, wenn es mehr als einen gibt. */
export default function ContestScopeBar({ scopes, active, onChange }: ContestScopeBarProps) {
  return (
    <GlassSegmented label={texts.scopesLabel} idPrefix="contest-scope" tone="soft" segments={scopes.map((id) => ({ id, label: texts.scopes[id], icon: ICONS[id] }))} active={active} onChange={onChange} />
  );
}
