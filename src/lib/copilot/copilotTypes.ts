import type { CoachContext } from "../coach/coachBriefing";
import type { CopilotProposal, CopilotToolCall, CopilotToolName, CopilotToolRound } from "./tools/copilotToolTypes";

/** Wie eine Antwort zustande kam: Server-KI (Enes) oder lokales Wissen ohne Netz bzw. im Demo-Modus. */
export type CopilotSource = "live" | "local";

export type CopilotFeedback = "up" | "down";

/** Knopf unter einer Antwort, der eine Seite der App öffnet. */
export interface CopilotAction {
  label: string;
  href: string;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  /** true, solange die Antwort noch tröpfelt oder lädt. */
  pending?: boolean;
  source?: CopilotSource;
  /** Kennung des Server-Protokolls, nur damit lässt sich 👍/👎 speichern (v1 Stufe 3). */
  logId?: string;
  intent?: string;
  feedback?: CopilotFeedback | null;
  actions?: readonly CopilotAction[];
  /** Vorschläge von Enes, die erst nach "Ja, mach" gespeichert werden. */
  proposals?: readonly CopilotProposal[];
}

/** Was der Server nach einer Antwort zusätzlich schickt (v1 SSE "done" bzw. JSON von /copilot/chat). */
export interface CopilotDone {
  logId?: string;
  intent?: string;
  action?: string;
  path?: string;
  /** false: Enes wartet auf Ergebnisse der Lese-Werkzeuge (v2). */
  final?: boolean;
  toolCalls?: CopilotToolCall[];
}

/** Anfrage an /copilot/chat(-stream), Felder wie in v1 plus Sparte. */
export interface CopilotPayload {
  message: string;
  history: readonly { sender: "user" | "ai"; text: string }[];
  currentPath: string;
  userName: string;
  userRole: string;
  vertical: string;
  /** Kennzahlen aus dem Coach-Profil, damit Enes persönlich antworten kann (keine Straßen, keine Namen). */
  coach?: CoachContext;
  /** Werkzeuge, die die App für diesen Nutzer ausführen kann (nur v2, v1 ignoriert es). */
  tools?: readonly CopilotToolName[];
  toolRounds?: readonly CopilotToolRound[];
}

/** Lokale Antwort: Text plus optionale Knöpfe. */
export interface CopilotReply {
  text: string;
  actions?: readonly CopilotAction[];
  /** Ziel, das sofort geöffnet werden soll (Sprachbefehl "öffne …"). */
  navigate?: CopilotAction;
}
