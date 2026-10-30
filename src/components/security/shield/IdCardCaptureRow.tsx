// Needs live camera, frame analysis, file input and state for the guided ID card scan
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { GLASS_DIVIDER } from "@/components/glass/glassStyles";
import IdentCaptureTile from "@/components/security/ident/IdentCaptureTile";
import IdentScanControls from "@/components/security/ident/IdentScanControls";
import IdentScanStage from "@/components/security/ident/IdentScanStage";
import IdentScanTips from "@/components/security/ident/IdentScanTips";
import { useCardAutoCapture } from "@/hooks/useCardAutoCapture";
import { useIdScanCamera } from "@/hooks/useIdScanCamera";
import { cn } from "@/lib/cn";
import { feedback } from "@/lib/feedback/feedback";
import { speak } from "@/lib/ident/voiceGuide";
import { watermarkIdImage } from "@/lib/security/kycVault";
import { identWizardTexts } from "@/texts/identWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";

interface IdCardCaptureRowProps {
  frontVerified: boolean;
  backVerified: boolean;
  frontDataUrl: string | null;
  backDataUrl: string | null;
  onFrontChange: (verified: boolean, dataUrl: string | null) => void;
  onBackChange: (verified: boolean, dataUrl: string | null) => void;
  /** Beide Seiten automatisch erfasst: der Ablauf darf weiter. */
  onComplete?: () => void;
}

type Side = "front" | "back";
const AUTO_ACCEPT_MS = 1600;

/** Schritt 2: vollautomatischer Live-Scan, erst Vorderseite, dann Rückseite; darunter beide Seiten mit Bestätigung. */
export default function IdCardCaptureRow({ frontVerified, backVerified, frontDataUrl, backDataUrl, onFrontChange, onBackChange, onComplete }: IdCardCaptureRowProps) {
  const cam = useIdScanCamera();
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [override, setOverride] = useState<Side | null>(null);
  const [preview, setPreview] = useState<{ url: string; auto: boolean } | null>(null);
  const side: Side | null = override ?? (!frontDataUrl ? "front" : !backDataUrl ? "back" : null);
  const { start, stop } = cam;

  useEffect(() => {
    if (side) void start();
    else stop();
  }, [side, start, stop]);

  const commit = (dataUrl: string) => {
    const otherDone = side === "front" ? Boolean(backDataUrl) : Boolean(frontDataUrl);
    if (side === "front") onFrontChange(true, dataUrl);
    else onBackChange(true, dataUrl);
    feedback("success");
    setPreview(null);
    setOverride(null);
    if (otherDone) {
      speak(identWizardTexts.cardAuto.say.done);
      onComplete?.();
    }
  };

  const shutter = async (auto: boolean) => {
    const stage = stageRef.current?.getBoundingClientRect();
    const frame = frameRef.current?.getBoundingClientRect();
    if (!stage?.height || !frame?.width) return;
    const shot = await cam.capture(stage.width / stage.height, frame.width / stage.width);
    if (shot) {
      feedback("tap");
      setPreview({ url: shot, auto });
    }
  };

  const auto = useCardAutoCapture({ videoRef: cam.videoRef, stageRef, frameRef, side, enabled: cam.state === "live" && !preview, onReady: () => void shutter(true) });

  useEffect(() => {
    if (!preview?.auto) return;
    const timer = window.setTimeout(() => commit(preview.url), AUTO_ACCEPT_MS);
    return () => window.clearTimeout(timer);
    // commit liest nur aktuelle Props; der Countdown hängt allein an der Vorschau
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && side) setPreview({ url: await watermarkIdImage(file), auto: false });
  };

  const tile = (s: Side) => {
    const front = s === "front";
    const verified = front ? frontVerified : backVerified;
    const dataUrl = front ? frontDataUrl : backDataUrl;
    const change = front ? onFrontChange : onBackChange;
    return (
      <IdentCaptureTile side={s} title={front ? identWizardTexts.scanFront : identWizardTexts.scanBack} confirmLabel={front ? securityGateTexts.identScanFrontLabel : securityGateTexts.identScanBackLabel} fileName={front ? identWizardTexts.scanFrontFile : identWizardTexts.scanBackFile} verified={verified} dataUrl={dataUrl} active={side === s} onToggle={() => change(!verified, dataUrl)} onRescan={() => { setPreview(null); setOverride(s); }} />
    );
  };

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
      <div className="space-y-4">
        <IdentScanStage stageRef={stageRef} frameRef={frameRef} videoRef={cam.videoRef} camera={cam.state} auto={auto} autoCaptured={Boolean(preview?.auto)} side={side} preview={preview?.url ?? null} />
        {side && <IdentScanControls camera={cam.state} hasPreview={Boolean(preview)} autoAcceptMs={preview?.auto ? AUTO_ACCEPT_MS : null} onShutter={() => void shutter(false)} onRetake={() => setPreview(null)} onAccept={() => preview && commit(preview.url)} onUpload={() => inputRef.current?.click()} onStartCamera={() => void start()} />}
        <input ref={inputRef} type="file" accept="image/*" onChange={(e) => void upload(e)} className="hidden" />
      </div>
      <div className="space-y-4">
        <div className={cn("glass-surface overflow-hidden rounded-[22px]", GLASS_DIVIDER, "[&>*+*]:before:left-3.5")}>
          {tile("front")}
          {tile("back")}
        </div>
        {side && !preview && <IdentScanTips />}
      </div>
    </div>
  );
}
