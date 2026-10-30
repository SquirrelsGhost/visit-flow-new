// Anfrage-Zustand und Demo-Freischaltung leben im Browser
"use client";

import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BACKOFFICE_CONTACT, BACKOFFICE_PRICE } from "../../lib/backoffice/backofficeConfig";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import GlassBody from "../glass/GlassBody";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import { GLASS_BUTTON, GLASS_FOOTER } from "../glass/glassStyles";
import BackofficeTeaserHero from "./BackofficeTeaserHero";
import BackofficeTeaserFeatures from "./BackofficeTeaserFeatures";

interface BackofficeTeaserProps {
  /** Admin schaut sich das Angebot nur an: Rückweg statt Anfrage. */
  preview: boolean;
  teamName?: string;
}

const SENT_KEY = "vf_backoffice_request";

function wasSent(): boolean {
  try {
    return window.localStorage.getItem(SENT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Angebot für Teamleiter ohne Add-on (Cross-Sell): Nutzen, Richtpreis und "Freischalten anfragen" per E-Mail. */
export default function BackofficeTeaser({ preview, teamName }: BackofficeTeaserProps) {
  const [sent, setSent] = useState(wasSent);
  const subject = encodeURIComponent(`Team-Backoffice freischalten${teamName ? ` – ${teamName}` : ""}`);
  const request = () => {
    try {
      window.localStorage.setItem(SENT_KEY, "1");
    } catch {
      // Ohne Speicher erscheint der Knopf beim nächsten Mal wieder.
    }
    setSent(true);
    toast.success(t.teaser.sent);
  };
  return (
    <GlassBody>
      <BackofficeTeaserHero price={BACKOFFICE_PRICE.monthly} />
      <BackofficeTeaserFeatures />
      <div>
        {preview ? (
          <GlassSection>
            <GlassRow icon={ArrowLeft} tone="gray" title={t.teaser.back} href="/team-backoffice" />
          </GlassSection>
        ) : (
          <a href={`mailto:${BACKOFFICE_CONTACT}?subject=${subject}`} onClick={request} className={GLASS_BUTTON}>
            {sent ? <CheckCircle2 aria-hidden className="h-4 w-4" /> : <Mail aria-hidden className="h-4 w-4" />}
            {sent ? t.teaser.ctaSent : t.teaser.cta}
          </a>
        )}
        <p className={GLASS_FOOTER}>{t.teaser.ctaHint}</p>
      </div>
    </GlassBody>
  );
}
