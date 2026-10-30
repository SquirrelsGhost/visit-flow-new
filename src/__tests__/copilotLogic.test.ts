import { describe, expect, it } from "vitest";
import { assistantContentFor } from "../lib/assistant/verticalAssistant";
import { cornerAt } from "../lib/copilot/copilotDock";
import { pageIntent } from "../lib/copilot/copilotIntents";
import { answerLocally, bestKnowledge, greetingFor } from "../lib/copilot/copilotLocal";
import { normalize, tokensOf } from "../lib/copilot/copilotMatch";
import { copilotSuggestions } from "../lib/copilot/copilotSuggestions";

const BERATER = { id: "u1", email: "b@x.de", role: "berater", name: "Lena Sommer" };
const TEAMLEITER = { id: "u2", email: "t@x.de", role: "teamleiter", name: "Tom Braun" };
const telco = assistantContentFor("telco").knowledge;

describe("copilotMatch", () => {
  it("normalisiert Umlaute und entfernt Füllwörter", () => {
    expect(normalize("Wo sind meine Aufträge?")).toBe("wo sind meine auftraege");
    expect(tokensOf("Kunde sagt: das ist zu teuer")).toEqual(["teuer"]);
  });
});

describe("pageIntent", () => {
  it("öffnet erlaubte Seiten per Wort", () => {
    expect(pageIntent("Öffne den Rechner", BERATER, "telco")?.href).toBe("/statistics");
    expect(pageIntent("Abrechnung", BERATER, "telco")?.href).toBe("/abrechnung");
    expect(pageIntent("zeig mir die Karte", BERATER, "telco")?.href).toBe("/dashboard");
  });

  it("öffnet keine Seiten ohne Recht und reagiert nicht auf lange Fragen ohne Öffnen-Wort", () => {
    expect(pageIntent("öffne die Lizenzen", BERATER, "telco")).toBeNull();
    expect(pageIntent("öffne die Lizenzen", TEAMLEITER, "telco")?.href).toBe("/subscription?licensing=true");
    expect(pageIntent("wie erkläre ich dem Kunden den Rechner beim Vergleich", BERATER, "telco")).toBeNull();
  });
});

describe("answerLocally", () => {
  it("findet den passenden Einwand in der Wissensdatenbank der Sparte", () => {
    expect(bestKnowledge(telco, "Kunde sagt: zu teuer")?.id).toBe("e1");
    const reply = answerLocally("keine Zeit an der Tür", { user: BERATER, vertical: "telco", knowledge: telco });
    expect(reply.text).toContain("Keine Zeit");
    expect(reply.actions?.[0]?.href).toBe("/pattern-analysis-demo");
  });

  it("navigiert bei Befehlen und gibt sonst einen Hinweis", () => {
    const ctx = { user: BERATER, vertical: "telco" as const, knowledge: telco };
    expect(answerLocally("öffne meine Aufträge", ctx).navigate?.href).toBe("/crm");
    expect(answerLocally("xyzzy", ctx).navigate).toBeUndefined();
  });
});

describe("Begrüßung, Vorschläge, Ecken", () => {
  it("grüßt mit Vornamen nach Tageszeit", () => {
    expect(greetingFor(BERATER, 8)).toContain("Guten Morgen, **Lena**");
    expect(greetingFor(null, 20)).toContain("Guten Abend");
  });

  it("schlägt Seitenfragen zuerst vor, Führungsrollen bekommen eine Teamfrage", () => {
    const lead = copilotSuggestions("/crm", "telco", TEAMLEITER);
    expect(lead[0]).toContain("Stornoquote");
    expect(lead[1]).toContain("Team");
    expect(copilotSuggestions("/battle", "solar", BERATER)).toHaveLength(4);
  });

  it("rastet in der nächsten Ecke ein", () => {
    expect(cornerAt(10, 10, 400, 800)).toBe("top-left");
    expect(cornerAt(390, 790, 400, 800)).toBe("bottom-right");
  });
});
