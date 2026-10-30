// Needs MediaRecorder, getUserMedia and live face analysis for the automatic liveness check
"use client";

import { Check, Download, Video } from "lucide-react";
import { useState } from "react";
import { GLASS_BUTTON_INLINE } from "@/components/glass/glassStyles";
import LiveVideoPinCard from "@/components/security/ident/LiveVideoPinCard";
import LiveVideoStage from "@/components/security/ident/LiveVideoStage";
import { useLiveVideoRecorder, LIVE_MOVE_COUNT } from "@/hooks/useLiveVideoRecorder";
import { useLivenessDetector } from "@/hooks/useLivenessDetector";
import { cn } from "@/lib/cn";
import { isVoiceEnabled, setVoiceEnabled } from "@/lib/ident/voiceGuide";
import { downloadDataUrlFile, type KycChallenge } from "@/lib/security/kycVault";
import { identWizardTexts } from "@/texts/identWizardTexts";

interface LiveVideoIdentRecorderProps {
  fullName: string;
  challenge: KycChallenge;
  verified: boolean;
  videoSha256: string | null;
  onVerified: (sha256: string, videoDataUrl: string) => void;
}

const SECONDARY =
  "glass-surface inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-foreground transition-[background-color,transform] duration-200 hover:bg-[var(--glass-hover)] active:scale-[0.98]";
const L = identWizardTexts.liveness;

/**
 * Schritt 3: Ein Tipp startet Kamera und Mikrofon, danach läuft alles von selbst: Ausrichten, Kopf links,
 * rechts, oben, Vorlesen. Kann das Gerät keine Gesichtserkennung, bestätigt man jede Bewegung von Hand.
 */
export default function LiveVideoIdentRecorder({ fullName, challenge, verified, videoSha256, onVerified }: LiveVideoIdentRecorderProps) {
  const rec = useLiveVideoRecorder(fullName, challenge.spokenPin, onVerified);
  const live = useLivenessDetector(rec.videoRef, rec.recording && !rec.camError ? rec.stream : null, () => void rec.finish());
  const [voiceOn, setVoiceOn] = useState(isVoiceEnabled);
  const manual = rec.recording && (rec.camError !== null || live.status === "unavailable");
  const moveIdx = manual ? rec.manualIdx : live.state.phase === "align" ? -1 : Math.min(live.state.moveIdx, LIVE_MOVE_COUNT - 1);
  const last = moveIdx === LIVE_MOVE_COUNT - 1;
  const promptMode = !manual && live.status === "loading" ? "loading" : !manual && live.hint ? "hint" : "normal";
  const prompt = promptMode === "loading" ? L.loading : promptMode === "hint" && live.hint ? L.hints[live.hint] : moveIdx < 0 ? L.align : identWizardTexts.videoMoves[moveIdx];

  const toggleVoice = () => {
    setVoiceEnabled(!voiceOn);
    setVoiceOn(!voiceOn);
  };

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
      <div className="space-y-4">
        <LiveVideoStage videoRef={rec.videoRef} recording={rec.recording} camError={rec.camError} moveIdx={moveIdx} prompt={prompt} promptMode={promptMode} progress={manual ? 0 : live.state.progress} audio={live.audio} detectedKey={live.detectedAt} verified={verified} videoSha256={videoSha256} voiceOn={voiceOn} onToggleVoice={toggleVoice} />

        {rec.recording ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {identWizardTexts.videoMoves.map((move, i) => (
                <span key={move} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i < moveIdx ? "bg-emerald-500" : i === moveIdx ? "bg-red-500" : "bg-[var(--glass-track)]")} />
              ))}
            </div>
            {manual ? (
              <button type="button" onClick={() => void rec.advanceManual()} className={cn(GLASS_BUTTON_INLINE, "shrink-0 px-5")}>
                {last ? <Check className="h-4 w-4" /> : null}
                {last ? identWizardTexts.videoFinish : identWizardTexts.videoConfirmMove}
              </button>
            ) : (
              <span className="shrink-0 text-[12px] font-medium text-[var(--glass-label)]">{L.blinks(live.state.blinks)}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void rec.start()} aria-label={verified ? undefined : identWizardTexts.videoStart} className={cn(verified ? SECONDARY : GLASS_BUTTON_INLINE, "px-5")}>
              <Video className="h-4 w-4" />
              {verified ? identWizardTexts.videoRestart : identWizardTexts.videoStartShort}
            </button>
            {rec.recordedUrl && (
              <button type="button" onClick={() => downloadDataUrlFile(rec.recordedUrl ?? "", `VisitFlow_VideoIdent_${challenge.spokenPin}.webm`)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400">
                <Download className="h-4 w-4" /> {identWizardTexts.videoDownload}
              </button>
            )}
          </div>
        )}
        {manual && rec.camError === null && <p className="text-[12px] leading-snug text-[var(--glass-label)]">{L.manual}</p>}
      </div>

      <LiveVideoPinCard fullName={fullName} spokenPin={challenge.spokenPin} highlight={rec.recording && last} />
    </div>
  );
}
