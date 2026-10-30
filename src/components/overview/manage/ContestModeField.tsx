import { Flag, Ticket } from "lucide-react";
import type { ContestMode } from "../../../lib/overview/contestTypes";
import { contestFormTexts as texts } from "../../../texts/contestFormTexts";
import GlassSegmented from "../../glass/GlassSegmented";

interface ContestModeFieldProps {
  mode: ContestMode;
  onChange: (mode: ContestMode) => void;
}

/** Rennen oder Verlosung als helle Segment-Leiste. */
export default function ContestModeField({ mode, onChange }: ContestModeFieldProps) {
  return (
    <GlassSegmented
      label={texts.modeLabel}
      idPrefix="contest-mode"
      tone="soft"
      active={mode}
      onChange={onChange}
      segments={[
        { id: "race", label: texts.modes.race, icon: Flag },
        { id: "qualification", label: texts.modes.qualification, icon: Ticket },
      ]}
    />
  );
}
