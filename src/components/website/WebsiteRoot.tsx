// Scroll-Container, Farbstimmung und Weiterleitung der nativen App: braucht den Browser
"use client";

import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useNativeAppRedirect } from "../../hooks/website/useNativeAppRedirect";
import { accentFont, displayFont } from "../../lib/website/websiteFonts";
import { WebsiteContext } from "../../lib/website/websiteContext";
import { TONES, type WebsiteTone } from "../../lib/website/websiteTones";
import WebsiteBackdrop from "./WebsiteBackdrop";

interface WebsiteRootProps {
  children: ReactNode;
}

/**
 * Hülle der Website: eigene Scrollfläche (Body scrollt in dieser App nicht), Lichthintergrund
 * und die aktuelle Farbstimmung als CSS-Variablen für Verläufe und Akzente.
 */
export default function WebsiteRoot({ children }: WebsiteRootProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [tone, setTone] = useState<WebsiteTone>("brand");
  const redirecting = useNativeAppRedirect();
  const value = useMemo(() => ({ scroller, tone, setTone }), [tone]);
  const colors = TONES.brand;

  if (redirecting) return null;

  return (
    <WebsiteContext.Provider value={value}>
      <div
        ref={scroller}
        className={`vfw-root ${displayFont.variable} ${accentFont.variable}`}
        style={{ "--vfw-text": colors.text, "--vfw-fill": colors.fill, "--vfw-accent": colors.accent } as CSSProperties}
      >
        <WebsiteBackdrop />
        <div className="relative z-10">{children}</div>
      </div>
    </WebsiteContext.Provider>
  );
}
