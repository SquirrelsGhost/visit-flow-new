import { AlertTriangle, Shield } from "lucide-react";
import { securityGateTexts } from "@/texts/securityGateTexts";
import { POLICY_PREAMBLE, POLICY_SECTIONS } from "@/texts/securityPolicyTexts";

interface PolicySectionsListProps {
  isLeader: boolean;
}

const SECTION_BOX_CLASS =
  "rounded-xl border border-slate-800/90 bg-slate-900/70 p-3.5 text-xs leading-relaxed text-slate-300";

export default function PolicySectionsList({ isLeader }: PolicySectionsListProps) {
  return (
    <div className="max-h-60 space-y-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 pr-2">
      <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/25 bg-emerald-950/20 p-3 text-xs text-emerald-200">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <p className="leading-relaxed">{POLICY_PREAMBLE}</p>
      </div>

      {isLeader && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/35 bg-amber-950/25 p-3 text-xs text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold text-amber-300">{securityGateTexts.gateLeaderWarningTitle}</p>
            <p className="mt-1 leading-relaxed">{securityGateTexts.gateLeaderWarningBody}</p>
          </div>
        </div>
      )}

      {POLICY_SECTIONS.map((sec) => (
        <div key={sec.id} className={SECTION_BOX_CLASS}>
          <h4 className="font-semibold text-white">{sec.heading}</h4>
          {sec.paragraphs.map((p, idx) => (
            <p key={idx} className="mt-1.5 text-slate-300">
              {p}
            </p>
          ))}
          {sec.bullets && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-300">
              {sec.bullets.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
