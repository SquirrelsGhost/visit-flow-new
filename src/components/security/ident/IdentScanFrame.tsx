import { motion, useReducedMotion } from "motion/react";
import type { RefObject } from "react";
import { cn } from "@/lib/cn";
import { identWizardTexts } from "@/texts/identWizardTexts";

interface IdentScanFrameProps {
  frameRef: RefObject<HTMLDivElement | null>;
  side: "front" | "back";
  /** Aufgenommenes Bild, das im Rahmen zur Kontrolle steht. */
  preview: string | null;
  scanning: boolean;
  /** 0..1 bis zur automatischen Aufnahme: der Rahmen leuchtet grün auf. */
  readiness: number;
}

const CORNER = "absolute h-7 w-7 border-white transition-colors duration-500";

/**
 * Ausweisförmiger Rahmen in der Mitte der Kamera: außen abgedunkelt, Ecken als Zielmarken, ein Scanstreifen
 * läuft durch. Ein gestrichelter Bereich zeigt, wo Lichtbild (vorne) bzw. die Zeichenzeilen (hinten) liegen sollen.
 */
export default function IdentScanFrame({ frameRef, side, preview, scanning, readiness }: IdentScanFrameProps) {
  const reduce = useReducedMotion();
  const guide = identWizardTexts.scanLive[side].guide;
  return (
    <div ref={frameRef} className="absolute left-1/2 top-[46%] aspect-[1.586] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-[16px] sm:w-[62%] lg:w-[84%] shadow-[0_0_0_9999px_rgba(3,4,10,0.58)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- Vorschau aus lokalem data:-URL */}
      {preview && <img src={preview} alt="" className="absolute inset-0 h-full w-full rounded-[16px] object-cover" />}
      {!preview && (
        <span aria-hidden className={cn("absolute border border-dashed border-white/45 text-[10px] font-semibold uppercase tracking-wider text-white/60", side === "front" ? "bottom-[14%] left-[7%] top-[18%] flex w-[26%] items-end justify-center rounded-lg pb-1.5" : "bottom-[9%] left-[6%] right-[6%] flex h-[24%] items-center justify-center rounded-md")}>
          {guide}
        </span>
      )}
      <span aria-hidden className={cn(CORNER, "-left-px -top-px rounded-tl-[16px] border-l-[3px] border-t-[3px]", preview && "border-emerald-400")} />
      <span aria-hidden className={cn(CORNER, "-right-px -top-px rounded-tr-[16px] border-r-[3px] border-t-[3px]", preview && "border-emerald-400")} />
      <span aria-hidden className={cn(CORNER, "-bottom-px -left-px rounded-bl-[16px] border-b-[3px] border-l-[3px]", preview && "border-emerald-400")} />
      <span aria-hidden className={cn(CORNER, "-bottom-px -right-px rounded-br-[16px] border-b-[3px] border-r-[3px]", preview && "border-emerald-400")} />
      <span aria-hidden className="absolute -inset-px rounded-[16px] ring-[3px] ring-emerald-400 transition-opacity duration-150" style={{ opacity: preview ? 1 : readiness }} />
      {scanning && !preview && !reduce && readiness === 0 && (
        <motion.span
          aria-hidden
          className="absolute inset-x-3 h-0.5 rounded-full bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_14px_rgba(248,113,113,0.9)]"
          initial={{ top: "8%" }}
          animate={{ top: ["8%", "92%", "8%"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
