import { Eraser } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useFormTexts } from "../../../hooks/useFormTexts";

interface SignaturePadProps {
  /** Wer unterschreibt; steht als Überschrift der Karte und hier für Screenreader. */
  title: string;
  onChange: (png: string | null) => void;
}

/** Innere Auflösung 2x (v1: 800 x 300), damit die Unterschrift im PDF scharf bleibt. */
const WIDTH = 800;
const HEIGHT = 300;
const INK = "#0f172a";

/**
 * Unterschriftenfeld (v1 SignaturePad) mit Pointer-Events statt Maus und Touch getrennt, damit auch der Stift
 * auf dem iPad sauber zeichnet. Papierweiß in hell und dunkel, weil die Unterschrift so auch im PDF steht.
 */
export default function SignaturePad({ title, onChange }: SignaturePadProps) {
  const texts = useFormTexts().takeover;
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
  }, []);

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) * WIDTH) / rect.width, y: ((e.clientY - rect.top) * HEIGHT) / rect.height };
  };

  const start = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
  };

  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext("2d");
    if (!drawing.current || !ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigned(true);
  };

  const end = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    if (signed) onChange(e.currentTarget.toDataURL("image/png"));
  };

  const clear = () => {
    canvas.current?.getContext("2d")?.clearRect(0, 0, WIDTH, HEIGHT);
    setSigned(false);
    onChange(null);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-[inset_0_1px_3px_rgba(15,23,42,0.12)] ring-1 ring-[var(--glass-divider)] dark:bg-white/95">
      <span aria-hidden className="pointer-events-none absolute right-6 bottom-9 left-6 border-b border-dashed border-slate-300" />
      <span aria-hidden className="pointer-events-none absolute bottom-9 left-6 text-lg font-semibold text-slate-300">
        ×
      </span>
      <canvas
        ref={canvas}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label={texts.signArea(title)}
        className="relative block h-[150px] w-full cursor-crosshair touch-none"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      {signed && (
        <button type="button" onClick={clear} className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[12px] font-semibold text-red-600">
          <Eraser className="h-3.5 w-3.5" aria-hidden />
          {texts.signClear}
        </button>
      )}
    </div>
  );
}
