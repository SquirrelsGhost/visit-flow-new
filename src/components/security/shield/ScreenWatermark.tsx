// Needs browser fingerprint and user context to render foreground forensic watermark
"use client";

import { useMemo } from "react";
import { getFingerprint } from "@/lib/security/fingerprint";

interface ScreenWatermarkProps {
  userEmail?: string | null;
  userId?: string | null;
}

export default function ScreenWatermark({ userEmail, userId }: ScreenWatermarkProps) {
  const bgDataUrl = useMemo(() => {
    if (!userEmail && !userId) return null;
    const fp = getFingerprint();
    const stamp = `${userEmail || userId} • ${fp} • VF-SHIELD`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="220"><text x="20" y="110" fill="rgba(120,130,145,0.032)" font-family="monospace" font-size="11" transform="rotate(-22 190 110)">${stamp.replace(/[<>&"']/g, "")}</text></svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }, [userEmail, userId]);

  if (!bgDataUrl) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden bg-repeat"
      style={{ backgroundImage: bgDataUrl }}
    />
  );
}
