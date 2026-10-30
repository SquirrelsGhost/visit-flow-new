import { useEffect, useRef, useState } from "react";
import { sha256Hex } from "@/lib/security/kycVault";
import { identWizardTexts } from "@/texts/identWizardTexts";

export const LIVE_MOVE_COUNT = identWizardTexts.videoMoves.length;

/**
 * Aufnahme des Live-Video-Ident: Kamera und Mikrofon starten, am Ende SHA-256 des Videos bilden.
 * Die Bewegungen erkennt useLivenessDetector; ohne Erkennung schaltet advanceManual von Hand weiter.
 * Ohne Kamera entsteht der Beweishash aus Name, Prüf-Code und Zeit.
 */
export function useLiveVideoRecorder(fullName: string, spokenPin: string, onVerified: (sha256: string, videoDataUrl: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [manualIdx, setManualIdx] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const start = async () => {
    setCamError(null);
    setManualIdx(0);
    chunksRef.current = [];
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error(identWizardTexts.videoNoApi);
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = media;
      setRecording(true);
      setStream(media);
      requestAnimationFrame(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = media;
        void videoRef.current.play().catch(() => undefined);
      });
      const recorder = new MediaRecorder(media);
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const hash = await sha256Hex(await blob.arrayBuffer());
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result ?? "");
          setRecordedUrl(dataUrl);
          onVerified(hash, dataUrl);
        };
        reader.readAsDataURL(blob);
        stopStream();
      };
      recorderRef.current = recorder;
      recorder.start();
    } catch {
      setCamError(identWizardTexts.videoNoCamera);
      setRecording(true);
    }
  };

  const finish = async () => {
    setRecording(false);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      stopStream();
      onVerified(await sha256Hex(`LIVENESS:${fullName}:${spokenPin}:${Date.now()}`), "");
    }
  };

  const advanceManual = async () => {
    if (manualIdx < LIVE_MOVE_COUNT - 1) setManualIdx((s) => s + 1);
    else await finish();
  };

  return { videoRef, stream, recording, manualIdx, recordedUrl, camError, start, finish, advanceManual };
}
