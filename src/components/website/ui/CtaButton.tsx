// Magnetischer Knopf mit Klang: braucht den Browser
"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";
import { siteFeedback } from "../../../lib/website/websiteFeedback";

/** Hauptknopf (roter Verlauf) oder Glasknopf. Zieht sich leicht zum Zeiger, klickt hörbar, wenn Klang an ist. */
interface CtaButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "glass";
  size?: "md" | "lg";
  disabled?: boolean;
}

const BASE = "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight text-white transition-colors";
const VARIANT = {
  primary: "vfw-cta",
  glass: "border border-white/12 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/[0.1]",
};
const SIZE = { md: "h-11 px-5 text-sm", lg: "h-14 px-7 text-base" };
const PULL = 0.25;

export default function CtaButton({ href, children, variant = "primary", size = "md", disabled = false }: CtaButtonProps) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - box.left - box.width / 2) * PULL);
    y.set((e.clientY - box.top - box.height / 2) * PULL);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  const className = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${disabled ? "cursor-default" : ""}`;

  return (
    <motion.span style={{ x, y }} className="inline-block" onPointerMove={onMove} onPointerLeave={reset} whileTap={{ scale: 0.96 }}>
      {disabled ? (
        <span className={className} aria-disabled onClick={() => siteFeedback("tap")}>
          {children}
        </span>
      ) : href.startsWith("#") ? (
        <a href={href} className={className} onClick={() => siteFeedback("tap")}>
          {children}
        </a>
      ) : (
        <Link href={href} className={className} onClick={() => siteFeedback("tap")}>
          {children}
        </Link>
      )}
    </motion.span>
  );
}
