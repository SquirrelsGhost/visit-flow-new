// Laden und Entscheiden leben im Browser
"use client";

import { CheckCircle2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadPendingDeletions, resolveDeletion } from "../../lib/streets/streetApi";
import type { PendingDoor } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassBody from "../glass/GlassBody";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import PendingDoorCard, { addressOf } from "./PendingDoorCard";
import ConfirmSheet from "./ConfirmSheet";

const texts = streetListTexts.deletions;

/** Reiter Lösch-Anfragen (nur Admin, v1 DeletionWaitlist): wiederherstellen oder endgültig löschen. */
export interface DeletionsTabProps { readonly _?: never; }

export default function DeletionsTab() {
  const [doors, setDoors] = useState<PendingDoor[] | null | undefined>(undefined);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<PendingDoor | null>(null);

  useEffect(() => {
    let alive = true;
    loadPendingDeletions().then(
      (list) => alive && setDoors(list),
      () => alive && setDoors(null),
    );
    return () => {
      alive = false;
    };
  }, []);

  const resolve = async (door: PendingDoor, action: "approve" | "reject") => {
    setConfirm(null);
    setBusy(door.id);
    const ok = await resolveDeletion(door.id, action);
    setBusy(null);
    if (!ok) return void toast.error(texts.failed);
    setDoors((list) => list?.filter((d) => d.id !== door.id));
    toast.success(action === "approve" ? texts.removed : texts.restored);
  };

  const list = doors ?? [];
  const label = doors ? (list.length === 1 ? texts.labelOne : fill(texts.label, { count: list.length })) : undefined;
  return (
    <GlassBody>
      {doors === undefined && (
        <GlassSection>
          <p className="px-4 py-5 text-[13px] text-muted-foreground">{texts.loading}</p>
        </GlassSection>
      )}
      {doors === null && (
        <GlassSection>
          <p className="px-4 py-5 text-[13px] text-red-600 dark:text-red-400">{texts.failed}</p>
        </GlassSection>
      )}
      {doors && list.length === 0 && (
        <GlassSection label={label} footer={texts.footer}>
          <GlassRow icon={CheckCircle2} tone="green" title={texts.empty} />
        </GlassSection>
      )}
      {list.length > 0 && (
        <GlassSection label={label} footer={texts.footer}>
          <AnimatePresence initial={false}>
            {list.map((door) => (
              <PendingDoorCard key={door.id} door={door} busy={busy === door.id} disabled={busy !== null} onRestore={() => void resolve(door, "reject")} onRemove={() => setConfirm(door)} />
            ))}
          </AnimatePresence>
        </GlassSection>
      )}
      <ConfirmSheet
        open={confirm !== null}
        title={texts.confirmTitle}
        text={confirm ? fill(texts.confirmText, { address: addressOf(confirm) }) : ""}
        confirm={texts.remove}
        onConfirm={() => confirm && void resolve(confirm, "approve")}
        onClose={() => setConfirm(null)}
      />
    </GlassBody>
  );
}
