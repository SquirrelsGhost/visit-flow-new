import { COACH_MEMORY_KINDS, type CoachMemoryKind } from "@visit-flow/shared/copilotSchema";

/** Was Enes neben dem sichtbaren Text mitteilt: eine Seite öffnen, sich etwas merken. */
export interface CopilotMarkers {
  nav: string | null;
  remember: { kind: CoachMemoryKind; content: string }[];
}

const MARKER = /\[\[(NAV|MERKEN):([^\]]{1,300})\]\]/g;
const MAX_REMEMBER = 2;
/** Nur App-Pfade, keine fremden Adressen. */
const SAFE_PATH = /^\/[\w\-/?=&]{0,80}$/;

function record(markers: CopilotMarkers, type: string, value: string): void {
  if (type === "NAV") {
    const path = value.trim();
    if (SAFE_PATH.test(path)) markers.nav = path;
    return;
  }
  const [rawKind, ...rest] = value.split("|");
  const kind = COACH_MEMORY_KINDS.find((k) => k === rawKind?.trim());
  const content = rest.join("|").trim();
  if (kind && content && markers.remember.length < MAX_REMEMBER) markers.remember.push({ kind, content: content.slice(0, 240) });
}

/**
 * Filtert die Marker [[NAV:/pfad]] und [[MERKEN:art|text]] aus dem gestreamten Text. Gibt nur
 * ganze Wörter weiter und hält einen angefangenen Marker zurück, bis er vollständig ist; so
 * landet nie ein halber Marker beim Nutzer und der Name lässt sich wortweise zurücksetzen.
 */
export function createMarkerFilter() {
  const markers: CopilotMarkers = { nav: null, remember: [] };
  let buffer = "";

  const extract = () => {
    buffer = buffer
      .replace(MARKER, (_match, type: string, value: string) => {
        record(markers, type, value);
        return "";
      })
      .replace(/ {2,}/g, " ");
  };

  return {
    markers,
    push(chunk: string): string {
      buffer += chunk;
      extract();
      const open = buffer.indexOf("[[");
      const limit = open >= 0 ? open : buffer.endsWith("[") ? buffer.length - 1 : buffer.length;
      const head = buffer.slice(0, limit);
      // Bis vor das letzte Leerzeichen: Das Wort davor ist sicher vollständig. Leerraum bleibt
      // zurück, damit am Ende (vor einem entfernten Marker) keiner übrig bleibt.
      let cut = Math.max(head.lastIndexOf(" "), head.lastIndexOf("\n"), 0);
      while (cut > 0 && /\s/.test(buffer.charAt(cut - 1))) cut -= 1;
      const out = buffer.slice(0, cut);
      buffer = buffer.slice(cut);
      return out;
    },
    /** Rest am Ende; ein nie geschlossener Marker wird verworfen. */
    end(): string {
      extract();
      const rest = buffer.replace(/\[\[[^\]]*$/, "");
      buffer = "";
      return rest.replace(/\s+$/, "");
    },
  };
}
