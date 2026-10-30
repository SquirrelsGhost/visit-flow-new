import { Check, Copy, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import { FIELD, SECONDARY } from "./onboardingClasses";

interface InviteLinkBoxProps {
  teamName: string;
  link: string;
}

const COPIED_MS = 2500;

/** Einladungslink zum Kopieren oder direkt für die WhatsApp-Gruppe. */
export default function InviteLinkBox({ teamName, link }: InviteLinkBoxProps) {
  const [copied, setCopied] = useState(false);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(T.whatsappText(teamName, link))}`;

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success(T.copyToast);
    } catch {
      toast.error(T.copyFailed);
    }
  }

  return (
    <motion.div variants={riseIn} className="glass-surface space-y-3 rounded-[24px] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{T.inviteTitle}</span>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{T.inviteReady}</span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          readOnly
          value={link}
          aria-label={T.inviteTitle}
          onFocus={(event) => event.target.select()}
          className={cn(FIELD, "h-10 flex-1 px-3.5 font-mono text-xs")}
        />
        <button type="button" onClick={() => void copy()} className={cn(SECONDARY, "h-10 rounded-xl px-4 text-xs")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "copied" : "copy"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? T.copied : T.copy}
            </motion.span>
          </AnimatePresence>
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          <Share2 className="h-4 w-4" />
          {T.whatsapp}
        </a>
      </div>
    </motion.div>
  );
}
