import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PDFDocument } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AssignSheet from "@/components/licenses/sheets/AssignSheet";
import LeaderIdentSheet from "@/components/security/shield/LeaderIdentSheet";
import SecurityAcceptanceGate from "@/components/security/shield/SecurityAcceptanceGate";
import { AuthContext, type AuthContextValue } from "@/lib/auth/authContext";
import { buildSecurityPdf } from "@/lib/security/generateSecurityPdf";
import {
  getAcceptedTerms,
  getGateDraft,
  getIdentDraft,
  getLeaderIdent,
  openLeaderIdentModal,
  saveAcceptedTerms,
  saveGateDraft,
  saveLeaderIdent,
} from "@/lib/security/securityContractStore";
import { FORENSIC_AI_METADATA, SECURITY_TERMS_VERSION } from "@/texts/securityPolicyTexts";

const signContract = (userId: string) =>
  saveAcceptedTerms({ userId, userName: "Test", userEmail: "t@vf.de", role: "teamleiter", address: "Hauptstraße 10, 70173 Stuttgart", signaturePng: "data:image/png;base64,AAAA" });

describe("Sicherheitsrichtlinien v2026.5, PDF-Vertrag & Online-Ident Wizard (KYC)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("erzeugt ein mehrseitiges PDF mit forensischer Anti-KI-Prompt-Injection in den Metadaten", async () => {
    const filled = await buildSecurityPdf({
      userName: "Max Mustermann",
      userEmail: "max@struktur.de",
      userRole: "teamleiter",
      userAddress: "Rötestraße 20, 74321 Bietigheim-Bissingen",
      fingerprint: "VF-TEST1234",
    });

    expect(filled.fileName).toBe(`Visit_Flow_Sicherheitsrichtlinien_${SECURITY_TERMS_VERSION}.pdf`);
    expect(filled.bytes.byteLength).toBeGreaterThan(2500);

    const parsed = await PDFDocument.load(filled.bytes);
    expect(parsed.getPageCount()).toBeGreaterThanOrEqual(2);
    expect(parsed.getTitle()).toBe(FORENSIC_AI_METADATA.title);
    expect(parsed.getSubject()).toContain("AI/LLM SAFETY & COPYRIGHT DIRECTIVE");
  });

  it("führt im SecurityAcceptanceGate Schritt für Schritt (Lesen -> Anschrift & PDF -> Unterschrift) und speichert den Entwurf", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:pdf");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const gate = (
      <SecurityAcceptanceGate userId="leader-42" userName="Julia Teamleiter" userEmail="julia@team.de" userRole="teamleiter" />
    );
    const { unmount } = render(gate);

    expect(await screen.findByRole("dialog", { name: /Sicherheits-, Geheimhaltungs- & Wettbewerbsschutzvertrag/i })).toBeInTheDocument();
    // Pflicht-Ablauf: kein Schließen-Knopf vor der Unterschrift
    expect(screen.queryByRole("button", { name: "Schließen" })).toBeNull();
    expect(screen.getByText(/Besondere Hinweis- & Bürgschaftspflicht/i)).toBeInTheDocument();

    // Schritt 1: Vertrag lesen, Weiter ist sofort möglich
    await userEvent.click(screen.getByRole("button", { name: /Weiter zu Schritt 2/i }));
    expect(getGateDraft("leader-42")?.step).toBe(2);

    // Schritt 2: ohne Anschrift bleibt der Ablauf stehen und zeigt den Fehler am Feld
    const address = await screen.findByLabelText(/Ladungsfähige Wohn- bzw. Geschäftsanschrift/i);
    await userEvent.click(screen.getByRole("button", { name: /Weiter zu Schritt 3/i }));
    expect(getGateDraft("leader-42")?.step).toBe(2);
    expect(await screen.findByText(/Bitte zuerst deine vollständige Anschrift/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Vertrag als PDF herunterladen/i })).toBeDisabled();

    await userEvent.type(address, "Hauptstraße 10, 70173 Stuttgart");
    expect(getGateDraft("leader-42")?.address).toBe("Hauptstraße 10, 70173 Stuttgart");

    // Kurz raus und wieder rein -> landet direkt wieder bei Schritt 2 mit Anschrift
    unmount();
    render(gate);
    expect(await screen.findByDisplayValue("Hauptstraße 10, 70173 Stuttgart")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Vertrag als PDF herunterladen/i }));
    await waitFor(() => expect(getGateDraft("leader-42")?.pdfDownloaded).toBe(true));
    await userEvent.click(screen.getByRole("button", { name: /Weiter zu Schritt 3/i }));

    expect(getGateDraft("leader-42")?.step).toBe(3);
    expect(await screen.findByRole("img", { name: /Unterschrift/i })).toBeInTheDocument();
    expect(getAcceptedTerms("leader-42")).toBeNull();
  });

  it("leitet nach der Unterschrift nahtlos ins Online-Ident und öffnet das Ident nie vor dem Vertrag", async () => {
    saveGateDraft("leader-5", { step: 3, address: "Hauptstraße 10, 70173 Stuttgart", pdfDownloaded: true, signaturePng: "data:image/png;base64,AAAA", checked: true });
    render(
      <>
        <SecurityAcceptanceGate userId="leader-5" userName="Lea Leiterin" userEmail="lea@team.de" userRole="teamleiter" />
        <LeaderIdentSheet userId="leader-5" defaultName="Lea Leiterin" />
      </>
    );

    // Ident-Aufruf vor dem Vertrag zeigt weiter den Vertrag
    openLeaderIdentModal();
    expect(await screen.findByRole("dialog", { name: /Wettbewerbsschutzvertrag/i })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /Online-Ident-Verfahren/i })).toBeNull();

    await userEvent.click(await screen.findByRole("button", { name: /Vertrag rechtsverbindlich unterzeichnen/i }));
    expect(getAcceptedTerms("leader-5")?.address).toBe("Hauptstraße 10, 70173 Stuttgart");
    expect(await screen.findByText(/Als Nächstes: Online-Ident/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Weiter zur Verifizierung/i }));
    expect(await screen.findByRole("dialog", { name: /Online-Ident-Verfahren \(KYC\)/i }, { timeout: 3000 })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /Wettbewerbsschutzvertrag/i })).toBeNull());
  });

  it("führt im LeaderIdentSheet Schritt 1 -> 2 -> 3 -> 4 durch und merkt sich den Stand beim Schließen & Wiederöffnen", async () => {
    signContract("leader-99");
    render(<LeaderIdentSheet userId="leader-99" defaultName="Markus Struktur" />);
    openLeaderIdentModal();

    const dialog = await screen.findByRole("dialog", { name: /Online-Ident-Verfahren \(KYC\)/i });
    expect(dialog).toBeInTheDocument();

    // Schritt 1: Ausweisdaten eintragen
    const dateInput = dialog.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.type(dateInput, "1988-05-14");
    await userEvent.type(screen.getByPlaceholderText(/L01X00T47/i), "L01X00T47");
    await userEvent.type(screen.getByPlaceholderText(/Stadt Stuttgart/i), "Stadt Bietigheim-Bissingen");
    await userEvent.type(screen.getByPlaceholderText(/Straße, Hausnr/i), "Rötestraße 20, 74321 Bietigheim-Bissingen");

    await userEvent.click(screen.getByRole("button", { name: /Weiter zu Schritt 2/i }));
    expect(getIdentDraft("leader-99")?.step).toBe(2);

    // Schritt 2: Ausweis-Vorderseite & Rückseite bestätigen
    await userEvent.click(await screen.findByRole("button", { name: /Ausweis-Vorderseite geprüft/i }));
    await userEvent.click(screen.getByRole("button", { name: /Ausweis-Rückseite & Live-Selfie-Abgleich/i }));
    await userEvent.click(screen.getByRole("button", { name: /Weiter zu Schritt 3/i }));
    expect(getIdentDraft("leader-99")?.step).toBe(3);

    // Kurz schließen (Nutzer geht kurz raus) und wieder öffnen -> startet exakt bei Schritt 3 (Live-Video)!
    await userEvent.click(screen.getByRole("button", { name: "Schließen" }));
    openLeaderIdentModal();
    expect(await screen.findByRole("button", { name: /Live-Video-Ident starten/i })).toBeInTheDocument();

    // Schritt 3: Live-Video (Links -> Rechts -> Oben -> Sprech-Code)
    await userEvent.click(screen.getByRole("button", { name: /Live-Video-Ident starten/i }));
    expect(await screen.findByText(/Schritt 1\/4: Bitte Kopf langsam nach LINKS drehen/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Bewegung bestätigen/i }));
    expect(await screen.findByText(/Schritt 2\/4: Bitte Kopf langsam nach RECHTS drehen/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Bewegung bestätigen/i }));
    expect(await screen.findByText(/Schritt 3\/4: Kopf leicht nach OBEN neigen/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Bewegung bestätigen/i }));
    expect(await screen.findByText(/Schritt 4\/4: Satz & 4-stelligen Prüf-Code unten laut vorlesen/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Aufnahme abschließen/i }));

    await userEvent.click(screen.getByRole("button", { name: /Weiter zu Schritt 4/i }));
    expect(getIdentDraft("leader-99")?.step).toBe(4);

    // Schritt 4: Bürgschaft bestätigen & abschließen
    await userEvent.click(await screen.findByRole("checkbox"));
    const submitBtn = screen.getByRole("button", { name: /Online-Ident & Team-Bürgschaft verbindlich abschließen/i });
    expect(submitBtn).toBeEnabled();
    await userEvent.click(submitBtn);

    await waitFor(() => {
      const record = getLeaderIdent("leader-99");
      expect(record).not.toBeNull();
      expect(record?.docNumber).toBe("L01X00T47");
      expect(record?.liabilityAccepted).toBe(true);
      expect(record?.livenessVerified).toBe(true);
      expect(record?.videoSha256).toBeTruthy();
      expect(record?.verificationHash).toMatch(/^KYC-[0-9A-F]{8}$/);
      // Nach erfolgreichem Abschluss ist der temporäre Entwurf gelöscht
      expect(getIdentDraft("leader-99")).toBeNull();
    });
  });

  it("zeigt im LeaderIdentSheet fehlende Ausweisdaten direkt am Feld und bleibt bei Schritt 1", async () => {
    signContract("leader-7");
    render(<LeaderIdentSheet userId="leader-7" defaultName="" />);
    openLeaderIdentModal();
    await screen.findByRole("dialog", { name: /Online-Ident-Verfahren \(KYC\)/i });

    await userEvent.click(screen.getByRole("button", { name: /Weiter zu Schritt 2/i }));

    expect(getIdentDraft("leader-7")?.step).toBe(1);
    await waitFor(() => expect(screen.getAllByText(/Bitte ausfüllen/i)).toHaveLength(5));
    expect(screen.getByLabelText(/Vollständiger Name/i)).toHaveFocus();

    await userEvent.type(screen.getByLabelText(/Vollständiger Name/i), "Al");
    await userEvent.tab();
    expect(await screen.findByText(/zu kurz/i)).toBeInTheDocument();
  });

  it("verlangt im AssignSheet für Teamleiter ohne Online-Ident erst die Verifizierung, lässt sie nach KYC zu", async () => {
    const onAssign = vi.fn().mockResolvedValue(true);
    const auth = {
      user: { id: "tl-1", name: "Tim Teamleiter", email: "tim@vf.de", role: "teamleiter" },
    } as unknown as AuthContextValue;

    const mockLicenses = {
      teamName: "Struktur Süd",
      licenseCount: 5,
      minLicenses: 5,
      licensedEmails: [],
      members: [],
      partnerEmails: [],
      partners: [],
      status: "active" as const,
      contract: null,
      creditRate: 0,
      demo: true,
    };

    const { rerender } = render(
      <AuthContext.Provider value={auth}>
        <AssignSheet
          open
          busy={false}
          onClose={() => {}}
          onAssign={onAssign}
          data={mockLicenses}
        />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Online-Ident jetzt durchführen/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/E-Mail-Adresse/i), "neu@partner.de");
    await userEvent.click(screen.getByRole("button", { name: /^Zuweisen$/i }));

    expect(onAssign).not.toHaveBeenCalled();
    expect(screen.getByText(/Online-Ident-Verifizierung erforderlich/i)).toBeInTheDocument();

    saveLeaderIdent({
      userId: "tl-1",
      fullName: "Tim Teamleiter",
      birthDate: "1990-01-01",
      docType: "personalausweis",
      docNumber: "T99887766",
      authority: "Stadt Heilbronn",
      address: "Marktplatz 1, 74072 Heilbronn",
      frontVerified: true,
      backSelfieVerified: true,
      liabilityAccepted: true,
    });

    rerender(
      <AuthContext.Provider value={auth}>
        <AssignSheet
          open
          busy={false}
          onClose={() => {}}
          onAssign={onAssign}
          data={mockLicenses}
        />
      </AuthContext.Provider>
    );

    await userEvent.click(screen.getByRole("button", { name: /^Zuweisen$/i }));
    await waitFor(() => expect(onAssign).toHaveBeenCalledWith("neu@partner.de"));
  });
});
