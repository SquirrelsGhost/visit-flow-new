// Formular mit Zustand und Netzwerk: braucht den Browser
"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import { WAITLIST_SHOW_COUNT_FROM, type WaitlistRole } from "../../../lib/waitlist/waitlistRules";
import { siteFeedback } from "../../../lib/website/websiteFeedback";
import { WEBSITE_LINKS } from "../../../lib/website/websiteLinks";
import { waitlistTexts as t } from "../../../texts/websiteWaitlistTexts";

/**
 * Warteliste statt "Demnächst": E-Mail, Rolle, Einwilligung. Nach dem Eintragen steht groß der eigene Platz.
 * Die Gesamtzahl erscheint erst ab WAITLIST_SHOW_COUNT_FROM Einträgen.
 */
type ErrorKey = keyof typeof t.errors;
type Result = { position: number; already: boolean };

const EASE = [0.22, 1, 0.36, 1] as const;

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WaitlistRole>("vertriebler");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((body: { success?: boolean; data?: { count?: number } }) => {
        if (alive && body.success && typeof body.data?.count === "number") setCount(body.data.count);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!consent) return setError("consent");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role, consent, website: trap }),
      });
      const body = (await res.json().catch(() => ({}))) as { success?: boolean; data?: Result; error?: string };
      if (body.success && body.data) {
        setResult(body.data);
        if (!body.data.already) setCount((c) => (c === null ? c : c + 1));
        siteFeedback("win");
      } else setError(body.error && body.error in t.errors ? (body.error as ErrorKey) : "other");
    } catch {
      setError("other");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-xl text-left">
      <AnimatePresence mode="wait" initial={false}>
        {result ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="vfw-bar relative isolate rounded-3xl px-6 py-6 text-center"
            role="status"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-white/55">{t.doneKicker}</p>
            <p className="mt-2 font-[family-name:var(--vfw-display)] text-[clamp(3rem,8vw,5rem)] font-extrabold leading-none tracking-[-0.05em] text-white">
              <span className="text-white/45">{t.donePlace} </span>
              <span className="vfw-gradient-text">#{result.position}</span>
            </p>
            <p className="mx-auto mt-3 max-w-sm text-pretty text-[15px] text-white/65">{result.already ? t.alreadyText : t.doneText}</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate aria-label={t.label} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <div role="radiogroup" aria-label={t.roleLabel} className="mx-auto mb-3 flex w-fit rounded-full border border-white/10 bg-white/[0.05] p-1">
              {(Object.keys(t.roles) as WaitlistRole[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={role === key}
                  onClick={() => setRole(key)}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${role === key ? "bg-white text-[#05060b]" : "text-white/65 hover:text-white"}`}
                >
                  {t.roles[key]}
                </button>
              ))}
            </div>
            <div className="vfw-bar relative isolate flex items-center gap-2 rounded-full p-1.5 pl-5">
              <label htmlFor="vfw-waitlist-email" className="sr-only">
                {t.emailLabel}
              </label>
              <input
                id="vfw-waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                aria-invalid={error === "email"}
                className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-white/35 focus:outline-none"
              />
              {/* Honigtopf: für Menschen unsichtbar */}
              <input tabIndex={-1} autoComplete="off" aria-hidden value={trap} onChange={(e) => setTrap(e.target.value)} name="website" className="absolute -left-[9999px] size-px opacity-0" />
              <button
                type="submit"
                disabled={busy}
                className="vfw-cta inline-flex h-12 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-white disabled:opacity-70"
              >
                {busy ? t.sending : t.submit}
                {!busy && <ArrowRight className="size-4" />}
              </button>
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 px-2 text-[12.5px] leading-snug text-white/55">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (e.target.checked && error === "consent") setError(null);
                }}
                className="mt-0.5 size-4 shrink-0 accent-[#f43f5e]"
              />
              <span>
                {t.consentBefore}
                <a href={WEBSITE_LINKS.privacy} target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-2 hover:text-white">
                  {t.consentLink}
                </a>
                {t.consentAfter}
              </span>
            </label>
            <p aria-live="polite" className="min-h-5 px-2 pt-1 text-[13px] text-[#ff8a8a]">
              {error ? t.errors[error] : count !== null && count >= WAITLIST_SHOW_COUNT_FROM ? (
                <span className="text-white/55">
                  {t.countBefore}
                  <strong className="text-white">{count.toLocaleString("de-DE")}</strong>
                  {t.countAfter}
                </span>
              ) : null}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
