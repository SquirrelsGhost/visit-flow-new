import type { ReactNode } from "react";
import { GLASS_PAGE } from "./glassStyles";

interface GlassPageProps {
  children: ReactNode;
}

/**
 * Rahmen einer Seite im Glas-Design. Den Lichthintergrund liefert der App-Rahmen (AppShell) für alle Seiten,
 * hier nur die volle Höhe, damit der Inhalt darüber scrollt.
 */
export default function GlassPage({ children }: GlassPageProps) {
  return <div className={GLASS_PAGE}>{children}</div>;
}
