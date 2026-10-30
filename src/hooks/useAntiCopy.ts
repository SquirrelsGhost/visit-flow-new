// Needs browser event listeners for copy watermarking and anti-inspection protection
"use client";

import { useEffect, useState } from "react";
import { encodeZeroWidth, getFingerprint } from "@/lib/security/fingerprint";

interface UseAntiCopyResult {
  locked: boolean;
  lockReason: string;
}

export default function useAntiCopy(userEmail?: string | null): UseAntiCopyResult {
  const [locked, setLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString() || "";
      if (selection.length <= 8) return;
      const fp = getFingerprint();
      const watermark = encodeZeroWidth(`${userEmail || "anon"}:${fp}:${Date.now()}`);
      const notice = `\n\n[Geschützter Auszug — Visit Flow Enterprise (${fp}) — § 4 GeschGehG]`;
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", `${selection}${watermark}${notice}`);
        e.preventDefault();
      }
    };

    const isProd = process.env.NODE_ENV === "production";
    let violationCount = 0;

    const recordViolation = (reason: string) => {
      if (!isProd) return;
      violationCount += 1;
      if (violationCount >= 3) {
        setLockReason(reason);
        setLocked(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isProd) return;
      const key = e.key.toUpperCase();
      const isInspect =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (key === "I" || key === "J" || key === "C")) ||
        (e.ctrlKey && key === "U");
      if (isInspect) {
        e.preventDefault();
        recordViolation("DEVTOOLS_SHORTCUT_BLOCKED");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (!isProd) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      e.preventDefault();
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [userEmail]);

  return { locked, lockReason };
}
