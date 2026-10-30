// Lädt die App nur im Browser: Theme, Sprache und Sitzung stehen im localStorage,
// und für Capacitor wird die App ohnehin statisch ausgeliefert.
"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const AppProviders = dynamic(() => import("./AppProviders"), { ssr: false });

interface ClientAppProps {
  children: ReactNode;
}

/** Hülle um alle Seiten. Auf dem Server bleibt sie leer, im Browser startet die App mit allen Providern. */
export default function ClientApp({ children }: ClientAppProps) {
  return <AppProviders>{children}</AppProviders>;
}
