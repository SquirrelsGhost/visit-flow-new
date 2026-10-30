import { CircleAlert, CircleCheck, ScanLine } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { RefObject } from "react";
import type { CardAutoState } from "@/hooks/useCardAutoCapture";
import type { ScanCameraState } from "@/hooks/useIdScanCamera";
import { cn } from "@/lib/cn";
import { identWizardTexts } from "@/texts/identWizardTexts";
import IdentScanFrame from "./IdentScanFrame";

interface IdentScanStageProps {
  stageRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  camera: ScanCameraState;
  auto: CardAutoState;
  autoCaptured: boolean;
  /** null = beide Seiten fertig. */
  side: "front" | "back" | null;
  preview: string | null;
}

const PILL = "rounded-full bg-black/55 text-white ring-1 ring-inset ring-white/15 backdrop-blur-md";
const T = identWizardTexts.scanLive;

/** Kamerabühne des Ausweis-Scans mit Rahmen, Live-Anzeige und der Anweisung, welche Seite jetzt dran ist. */
export default function IdentScanStage({ stageRef, frameRef, videoRef, camera, auto, autoCaptured, side, preview }: IdentScanStageProps) {
  const live = camera === "live";
  const A = identWizardTexts.cardAuto;
  const waitingHint = auto.hint && auto.hint !== "noCard" && auto.hint !== "noPortrait" ? A.hints[auto.hint] : null;
  const message = !side ? "" : preview ? (autoCaptured ? `${A.captured} · ${A.autoAccept}` : T.previewHint) : !live ? T[side].instruction : auto.progress > 0 ? A.ready : (waitingHint ?? T[side].instruction);
  const tone = preview || auto.progress > 0 ? "ok" : live && waitingHint && auto.hint !== "holdStill" ? "warn" : "scan";
  return (
    <div ref={stageRef} className="glass-keep-white relative aspect-square w-full overflow-hidden rounded-[24px] bg-[radial-gradient(120%_90%_at_50%_0%,#1b1f33,#07080d_70%)] text-white sm:aspect-[16/10] lg:aspect-square">
      {live && <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full object-cover" />}

      {side ? (
        <>
          <IdentScanFrame frameRef={frameRef} side={side} preview={preview} scanning={live} readiness={auto.progress} />
          {live && !preview && (
            <span className={`${PILL} absolute left-3 top-3 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider`}>
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none" /> {T.live}
            </span>
          )}
          <span className={`${PILL} absolute right-3 top-3 px-2.5 py-1 text-[11px] font-semibold`}>
            {T[side].label} · {T[side].step}
          </span>
          {camera !== "live" && !preview && (
            <p className="absolute inset-x-6 top-[46%] -translate-y-1/2 text-center text-[13px] font-medium leading-snug text-white/80">{camera === "unavailable" ? T.unavailable : camera === "starting" ? T.starting : ""}</p>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${side}-${message}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className={`${PILL} absolute inset-x-3 bottom-3 flex items-center gap-3 !rounded-2xl px-3.5 py-2.5`}>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", tone === "ok" ? "bg-emerald-500" : tone === "warn" ? "bg-amber-500" : "bg-gradient-to-b from-red-500 to-red-600")}>
                {tone === "ok" ? <CircleCheck className="h-4 w-4" /> : tone === "warn" ? <CircleAlert className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
              </span>
              <span className="text-[13px] font-semibold leading-snug">{message}</span>
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-950/35">
          <CircleCheck className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_18px_rgba(52,211,153,0.6)]" />
          <p className="text-[14px] font-semibold">{T.done}</p>
        </motion.div>
      )}
    </div>
  );
}
