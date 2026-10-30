// Rahmen aller Seiten nach dem Login; reagiert auf den Pfad für die Seiten-Animation
"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NAV_HEIGHT } from "../../lib/navigation/navItems";
import Copilot from "../copilot/Copilot";
import GlassBackdrop from "../glass/GlassBackdrop";
import BottomNav from "./BottomNav";
import Topbar from "./Topbar";

interface AppShellProps {
  children: ReactNode;
}

/**
 * App-Rahmen aus v1 (MainLayout): Topbar oben, Inhalt dazwischen, untere Navigation, dahinter der Lichthintergrund des Glas-Designs.
 * Darüber schwebt auf jeder Seite der AI-Copilot Enes.
 * Jede Seite blendet weich ein (v1: fade + zoom 0.99 + 5px von unten), hier zusätzlich aus leichter Unschärfe.
 */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  return (
    <div className="relative isolate flex h-[100dvh] w-full flex-col overflow-hidden bg-background">
      <GlassBackdrop />
      <Topbar />
      <motion.main
        key={pathname}
        data-main-content="true"
        className="relative min-h-0 w-full flex-1 pt-[calc(5rem+env(safe-area-inset-top))] md:pt-[calc(6rem+env(safe-area-inset-top))]"
        style={{ paddingBottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))` }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      <BottomNav />
      <Copilot />
    </div>
  );
}
