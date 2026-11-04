// Reagiert auf Scrollen: braucht den Browser
"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { useWebsite } from "../../../hooks/website/useWebsite";
import { NAV_SOLID_AFTER } from "../../../lib/website/websiteLinks";
import { websiteTexts } from "../../../texts/websiteTexts";
import CompassMark from "../ui/CompassMark";
import NavAccountButton from "./NavAccountButton";
import NavLinks from "./NavLinks";
import NavSoundToggle from "./NavSoundToggle";

/** Schwebende Glasleiste: oben durchsichtig, beim Scrollen Glas mit Unschärfe und einer Fortschrittslinie. */
export interface WebsiteNavProps { readonly _?: never; }

const t = websiteTexts.nav;

export default function WebsiteNav() {
  const { scroller } = useWebsite();
  const { scrollY, scrollYProgress } = useScroll({ container: scroller });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > NAV_SOLID_AFTER));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <motion.nav
        aria-label={t.label}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={`pointer-events-auto relative isolate mx-auto flex h-14 max-w-6xl items-center gap-3 overflow-hidden rounded-full pl-2.5 pr-2 transition-[box-shadow] duration-500 ${
          solid ? "vfw-bar shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]" : ""
        }`}
      >
        <Link href="/" aria-label={t.home} className="flex items-center gap-2.5 pr-2">
          <CompassMark size={34} />
          <span className="text-[17px] font-bold tracking-tight">{websiteTexts.brand}</span>
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-1.5">
          <NavSoundToggle />
          <NavAccountButton />
        </div>
        <motion.span
          aria-hidden
          style={{ scaleX: progress }}
          className={`absolute inset-x-6 bottom-0 h-px origin-left bg-gradient-to-r from-rose-400 via-red-500 to-violet-400 transition-opacity ${solid ? "opacity-100" : "opacity-0"}`}
        />
      </motion.nav>
    </header>
  );
}
