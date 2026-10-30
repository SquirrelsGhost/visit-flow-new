import { Camera, Check, ImagePlus, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { GLASS_BUTTON_INLINE } from "@/components/glass/glassStyles";
import type { ScanCameraState } from "@/hooks/useIdScanCamera";
import { cn } from "@/lib/cn";
import { identWizardTexts } from "@/texts/identWizardTexts";

interface IdentScanControlsProps {
  camera: ScanCameraState;
  hasPreview: boolean;
  /** Automatisch aufgenommen: Übernehmen läuft als Countdown von selbst ab. */
  autoAcceptMs: number | null;
  onShutter: () => void;
  onRetake: () => void;
  onAccept: () => void;
  onUpload: () => void;
  onStartCamera: () => void;
}

const T = identWizardTexts.scanLive;
const SECONDARY =
  "glass-surface inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-foreground transition-[background-color,transform] duration-200 hover:bg-[var(--glass-hover)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";

/** Bedienleiste unter der Kamera: Auslöser wie in der Kamera-App, danach Nochmal oder Übernehmen. */
export default function IdentScanControls({ camera, hasPreview, autoAcceptMs, onShutter, onRetake, onAccept, onUpload, onStartCamera }: IdentScanControlsProps) {
  if (hasPreview) {
    return (
      <div className="flex gap-3">
        <button type="button" onClick={onRetake} className={SECONDARY}>
          <RotateCcw className="h-4 w-4" /> {T.retake}
        </button>
        <button type="button" onClick={onAccept} className={cn(GLASS_BUTTON_INLINE, "flex-1 px-5")}>
          {autoAcceptMs && <motion.span aria-hidden className="absolute inset-0 origin-left bg-white/20" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: autoAcceptMs / 1000, ease: "linear" }} />}
          <Check className="relative h-4 w-4" /> <span className="relative">{T.accept}</span>
        </button>
      </div>
    );
  }
  if (camera !== "live") {
    return (
      <div className="flex flex-wrap gap-3">
        {camera !== "unavailable" && (
          <button type="button" onClick={onStartCamera} disabled={camera === "starting"} className={cn(GLASS_BUTTON_INLINE, "flex-1 px-5")}>
            <Camera className="h-4 w-4" /> {T.startCamera}
          </button>
        )}
        <button type="button" onClick={onUpload} className={cn(SECONDARY, camera === "unavailable" && "flex-1")}>
          <ImagePlus className="h-4 w-4" /> {T.upload}
        </button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center">
      <button type="button" onClick={onUpload} aria-label={T.upload} title={T.upload} className={cn(SECONDARY, "w-12 justify-self-start px-0")}>
        <ImagePlus className="h-5 w-5" />
      </button>
      <button type="button" onClick={onShutter} aria-label={T.shutter} className="group flex h-[68px] w-[68px] items-center justify-center rounded-full ring-[3px] ring-slate-300 transition-transform duration-150 active:scale-90 focus:outline-none focus-visible:ring-red-400 dark:ring-white/80">
        <span className="h-[54px] w-[54px] rounded-full bg-gradient-to-b from-red-500 to-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_22px_-6px_rgba(220,38,38,0.85)] transition-transform duration-150 group-hover:scale-95" />
      </button>
      <span className="justify-self-end text-right text-[11.5px] leading-tight text-[var(--glass-label)]">{identWizardTexts.cardAuto.autoHint}</span>
    </div>
  );
}
