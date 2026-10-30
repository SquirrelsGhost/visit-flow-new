import { ArrowUp, Mic } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useSpeechInput } from "../../hooks/useSpeechInput";
import { cn } from "../../lib/cn";
import { copilotTexts } from "../../texts/copilotTexts";
import { GLASS_FIELD } from "../glass/glassStyles";

interface CopilotComposerProps {
  busy: boolean;
  onSend: (text: string) => void;
}

const ROUND = "no-touch-target-fix absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-xl transition-[transform,background-color,color] duration-200 active:scale-90";
const SEND = "glass-keep-white bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_18px_-8px_rgba(220,38,38,0.75)] disabled:opacity-50";

/** Eingabe unten im Chat: Text oder Diktat (v1 Mikrofon), der Knopf wechselt zwischen Mikro und Senden. */
export default function CopilotComposer({ busy, onSend }: CopilotComposerProps) {
  const [text, setText] = useState("");
  const { listening, toggle } = useSpeechInput(setText);
  const hasText = text.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!hasText || busy) return;
    if (listening) toggle();
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={submit} className="shrink-0 border-t border-[var(--glass-divider)] px-4 pb-4 pt-3">
      <div className="relative">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={listening ? copilotTexts.listening : copilotTexts.placeholder}
          aria-label={copilotTexts.placeholder}
          enterKeyHint="send"
          className={cn(GLASS_FIELD, "pr-14", listening && "border-red-400/60 ring-4 ring-red-500/10")}
        />
        {hasText ? (
          <button type="submit" disabled={busy} aria-label={copilotTexts.send} className={cn(ROUND, SEND)}>
            <ArrowUp className="h-4.5 w-4.5" strokeWidth={2.6} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggle}
            aria-label={listening ? copilotTexts.micStop : copilotTexts.micStart}
            className={cn(ROUND, listening ? "bg-red-500/15 text-red-600 dark:text-rose-300" : "text-slate-400 hover:bg-[var(--glass-hover)] hover:text-foreground dark:text-white/40")}
          >
            {listening && <span aria-hidden className="absolute inset-0 rounded-xl ring-2 ring-red-500/60 motion-safe:animate-ping" />}
            <Mic className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </form>
  );
}
