/** Farben passend zum Glas-Design: Rot der App, Gold, Smaragd, Himmelblau und Weißglanz. */
const COLORS = ["#ef4444", "#f87171", "#fbbf24", "#34d399", "#38bdf8", "#ffffff"];
const COUNT = 90;
const DURATION_MS = 1800;
const GRAVITY = 0.32;
const DRAG = 0.985;

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  spin: number;
  color: string;
  round: boolean;
}

function spawn(width: number, height: number): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => {
    // Zwei Fontänen von links und rechts unten, leicht zur Mitte geneigt
    const fromLeft = i % 2 === 0;
    const angle = (fromLeft ? -60 : -120) + (Math.random() - 0.5) * 40;
    const speed = 11 + Math.random() * 9;
    const rad = (angle * Math.PI) / 180;
    return {
      x: fromLeft ? width * 0.12 : width * 0.88,
      y: height * 0.92,
      vx: Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.4,
      color: COLORS[i % COLORS.length],
      round: Math.random() < 0.3,
    };
  });
}

/** Zeichnet einen kurzen Konfetti-Regen auf `canvas` und ruft danach `done` auf. Gibt eine Abbruch-Funktion zurück. */
export function runConfetti(canvas: HTMLCanvasElement, done: () => void): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    done();
    return () => undefined;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  const pieces = spawn(width, height);
  const start = performance.now();
  let frame = 0;

  const draw = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, width, height);
    const fade = t > DURATION_MS * 0.65 ? Math.max(0, 1 - (t - DURATION_MS * 0.65) / (DURATION_MS * 0.35)) : 1;
    for (const p of pieces) {
      p.vx *= DRAG;
      p.vy = p.vy * DRAG + GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Flackern wie ein drehendes Blättchen
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, (p.size / 2) * Math.abs(Math.cos(p.rot * 2)) + 1);
      }
      ctx.restore();
    }
    if (t < DURATION_MS) frame = requestAnimationFrame(draw);
    else {
      ctx.clearRect(0, 0, width, height);
      done();
    }
  };
  frame = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(frame);
}
