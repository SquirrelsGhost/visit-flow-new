import { FileCheck2 } from "lucide-react";
import { formatStamp, useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { TermsAcceptance } from "../../../lib/security/securityThreatTypes";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";

interface TermsCardProps {
  terms: TermsAcceptance[];
}

const MAX = 6;

/** Wer die Sicherheitsvereinbarung bestätigt hat (v1 Security-Verträge), mit Zeit und IP. */
export default function TermsCard({ terms }: TermsCardProps) {
  const t = useSecurityTexts();
  return (
    <GlassSection label={t.terms.label} footer={t.terms.footer}>
      {terms.length === 0 && <GlassRow icon={FileCheck2} tone="gray" title={t.terms.empty} />}
      {terms.slice(0, MAX).map((x) => (
        <GlassRow key={`${x.userId}-${x.timestamp}`} icon={FileCheck2} tone="green" title={x.email} subtitle={`${formatStamp(t, x.timestamp)} · ${x.ip}`} />
      ))}
    </GlassSection>
  );
}
