import { useCallback, useEffect, useRef, useState } from "react";
import { watermarkIdImage } from "@/lib/security/kycVault";

/** Seitenverhältnis einer Ausweiskarte (ID-1, 85,6 × 54 mm). */
export const ID_CARD_RATIO = 1.586;

/** Ausschnitt des Rahmens im Kamerabild (object-cover beachtet), in Videopixeln. */
export function frameCrop(vw: number, vh: number, stageRatio: number, frameShare: number) {
  const visW = vw / vh > stageRatio ? vh * stageRatio : vw;
  const w = visW * frameShare;
  const h = w / ID_CARD_RATIO;
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
}

export type ScanCameraState = "idle" | "starting" | "live" | "unavailable";

/**
 * Live-Kamera für den Ausweis-Scan: bevorzugt die Rückkamera, schneidet beim Auslösen genau den Rahmen aus
 * und brennt das Wasserzeichen nach § 20 PAuswG ein. Bewusst nie gespiegelt, damit Schrift und Lichtbild
 * auch mit der Frontkamera seitenrichtig erscheinen.
 */
export function useIdScanCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<ScanCameraState>("idle");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState((s) => (s === "unavailable" ? s : "idle"));
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unavailable");
      return;
    }
    setState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      setState("live");
      requestAnimationFrame(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        void videoRef.current.play().catch(() => undefined);
      });
    } catch {
      setState("unavailable");
    }
  }, []);

  /**
   * Schneidet den sichtbaren Rahmen aus dem Kamerabild (object-cover beachtet) und liefert das Bild mit Wasserzeichen.
   * stageRatio = Breite/Höhe der Bühne, frameShare = Rahmenbreite/Bühnenbreite, beides aus dem DOM gemessen.
   */
  const capture = useCallback(async (stageRatio: number, frameShare: number): Promise<string | null> => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const crop = frameCrop(video.videoWidth, video.videoHeight, stageRatio, frameShare);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(crop.w);
    canvas.height = Math.round(crop.h);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    return blob ? watermarkIdImage(new File([blob], "ausweis.jpg", { type: "image/jpeg" })) : null;
  }, []);

  return { videoRef, state, start, stop, capture };
}
