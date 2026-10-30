import { FileDown, Flag } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { countryFlag, type Age } from "../../../lib/security/securityLogic";
import type { Intruder } from "../../../lib/security/securityThreatTypes";
import GlassChip from "../../glass/GlassChip";
import Mono from "../shared/Mono";
import RowButton from "../shared/RowButton";

interface IntruderRowProps {
  intruder: Intruder;
  age: Age;
  onReport: (intruder: Intruder) => void;
}

/** Ein Treffer in einer Honeypot-Falle (v1 HoneypotIntruderPanel): Ort, Gerät, Pfad, Köder und Meldestatus. */
export default function IntruderRow({ intruder: i, age, onReport }: IntruderRowProps) {
  const t = useSecurityTexts();
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--glass-track)] text-[18px] ring-1 ring-inset ring-[var(--glass-divider)]">
        {countryFlag(i.countryCode)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-foreground">
            <Mono>{i.ip}</Mono>
          </span>
          <span className="shrink-0 text-[12px] text-[var(--glass-label)]">{t.ago(age)}</span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{[[i.city, i.country].filter(Boolean).join(", "), i.isp, i.browser, i.os].filter(Boolean).join(" · ")}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="max-w-full truncate rounded-lg bg-[var(--glass-track)]/70 px-2 py-1">
            <Mono>{i.path}</Mono>
          </span>
          {i.fileServed && (
            <GlassChip tone="amber">
              <FileDown aria-hidden className="h-3 w-3" />
              {t.honeypot.file(i.fileType)}
            </GlassChip>
          )}
          {i.reported ? (
            <GlassChip tone="green">
              <Flag aria-hidden className="h-3 w-3" />
              {t.honeypot.reported}
            </GlassChip>
          ) : (
            <RowButton label={t.honeypot.reportShort} tone="red" icon={Flag} ariaLabel={`${t.honeypot.report}: ${i.ip}`} onClick={() => onReport(i)} />
          )}
        </div>
      </div>
    </div>
  );
}
