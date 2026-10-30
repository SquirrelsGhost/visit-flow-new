// Entwurf der Ziele lebt im Browser
"use client";

import { Sigma } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Vertical } from "../../../lib/battle/battleCategories";
import type { ProductCategory } from "../../../lib/map/productMeta";
import { PRODUCT_GROUP_META, productGroupsFor } from "../../../lib/overview/productGroups";
import { writeTeamGoals, type TeamGoals } from "../../../lib/overview/teamGoals";
import { manageTexts } from "../../../texts/manageTexts";
import GlassIcon from "../../glass/GlassIcon";
import GlassSheet from "../../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_CARD, GLASS_DIVIDER, GLASS_TITLE } from "../../glass/glassStyles";
import NumberStepper from "./NumberStepper";

interface GoalsSheetProps {
  open: boolean;
  teamId: string;
  vertical: Vertical;
  goals: TeamGoals;
  onSaved: (goals: TeamGoals) => void;
  onClose: () => void;
}

const texts = manageTexts.goals;

/** Monatsziele je Produktgruppe der aktiven Sparte setzen (v1 Teamziele), dazu ein Gesamtziel. */
export default function GoalsSheet({ open, teamId, vertical, goals, onSaved, onClose }: GoalsSheetProps) {
  const [draft, setDraft] = useState<TeamGoals>(goals);
  const keys = [...productGroupsFor(vertical), "total"] as const;

  const save = () => {
    if (!writeTeamGoals(teamId, vertical, draft)) return void toast.error(texts.failed);
    toast.success(texts.saved);
    onSaved(draft);
    onClose();
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={texts.sheetTitle} subtitle={texts.sheetHint}>
      <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
        {keys.map((key) => {
          const meta = PRODUCT_GROUP_META[key as ProductCategory];
          const label = meta?.label ?? texts.total;
          return (
            <div key={key} className="flex items-center gap-3.5 px-4 py-2.5">
              <GlassIcon icon={meta?.icon ?? Sigma} tone={meta?.tone ?? "red"} />
              <span className={`${GLASS_TITLE} min-w-0 flex-1 truncate`}>{label}</span>
              <NumberStepper label={label} value={draft[key] ?? 0} onChange={(value) => setDraft((d) => ({ ...d, [key]: value }))} />
            </div>
          );
        })}
      </div>
      <button type="button" onClick={save} className={GLASS_BUTTON}>
        {manageTexts.member.save}
      </button>
    </GlassSheet>
  );
}
