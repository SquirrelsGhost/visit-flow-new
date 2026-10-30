import { CircleCheck, ScanFace, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { RefObject } from "react";
import { identWizardTexts } from "@/texts/identWizardTexts";
import LiveVideoOval from "./LiveVideoOval";
import LiveVideoPrompt from "./LiveVideoPrompt";

interface LiveVideoStageProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  recording: boolean;
  camError: string | null;
  /** -1 = Ausrichten, 0..3 = Bewegung. */
  moveIdx: number;
  prompt: string;
  promptMode: "loading" | "hint" | "normal";
  progress: number;
  audio: number;
  /** Ändert sich bei jeder erkannten Bewegung und blendet kurz ein Häkchen ein. */
  detectedKey: number;
  verified: boolean;
  videoSha256: string | null;
  voiceOn: boolean;
  onToggleVoice: () => void;
}

const PILL = "rounded-full bg-black/55 text-white ring-1 ring-inset ring-white/15 backdrop-blur-md";
const L = identWizardTexts.liveness;

/** Kamerabild mit Gesichtsoval, Fortschrittsring, Aufnahme-Anzeige, Sprachansage-Schalter und Anweisung. */
export default function LiveVideoStage({ videoRef, recording, camError, moveIdx, prompt, promptMode, progress, audio, detectedKey, verified, videoSha256, voiceOn, onToggleVoice }: LiveVideoStageProps) {
  const done = verified && !recording;
  const tone = done ? "done" : !recording ? "idle" : promptMode === "hint" ? "warn" : "live";

  return (
    <div className="glass-keep-white relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-[radial-gradient(120%_90%_at_50%_0%,#1b1f33,#07080d_70%)] text-white sm:aspect-video lg:aspect-[4/3]">
      {recording && !camError && <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />}
      {!camError && <LiveVideoOval tone={tone} progress={recording ? progress : done ? 1 : 0} />}
      {!recording && !done && <ScanFace aria-hidden className="absolute inset-0 m-auto h-12 w-12 text-white/45" strokeWidth={1.5} />}

      {done && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-950/35">
          <CircleCheck className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_18px_rgba(52,211,153,0.6)]" />
          <p className="text-[14px] font-semibold">{identWizardTexts.videoDone}</p>
          {videoSha256 && <p className="font-mono text-[11px] text-white/60">SHA-256: {videoSha256.slice(0, 12)}…</p>}
        </motion.div>
      )}

      {recording && (
        <>
          <span className={`${PILL} absolute left-3 top-3 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider`}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none" /> REC
          </span>
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <button type="button" onClick={onToggleVoice} aria-label={voiceOn ? L.voiceOff : L.voiceOn} title={voiceOn ? L.voiceOff : L.voiceOn} className={`${PILL} no-touch-target-fix flex h-7 w-7 items-center justify-center`}>
              {voiceOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
            <span className={`${PILL} px-2.5 py-1 font-mono text-[11px]`}>
              {Math.max(0, moveIdx) + 1}/{identWizardTexts.videoMoves.length}
            </span>
          </div>
          {camError && (
            <div className="absolute inset-x-6 bottom-20 top-12 flex flex-col items-center justify-center gap-2 text-center">
              <ScanFace aria-hidden className="h-9 w-9 text-amber-300/80" strokeWidth={1.5} />
              <p className="text-[12.5px] font-medium leading-snug text-amber-200">{camError}</p>
            </div>
          )}
          <AnimatePresence>
            {detectedKey > 0 && (
              <motion.div key={detectedKey} initial={{ opacity: 1, scale: 0.8 }} animate={{ opacity: 0, scale: 1.15 }} transition={{ duration: 0.9, ease: "easeOut" }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-[14px] font-bold shadow-[0_10px_30px_-8px_rgba(16,185,129,0.9)]">
                  <CircleCheck className="h-5 w-5" /> {L.detected}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <LiveVideoPrompt moveIdx={moveIdx} text={prompt} mode={promptMode} audio={audio} />
        </>
      )}
    </div>
  );
}
