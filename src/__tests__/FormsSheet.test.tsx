import { fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import AssistantView from "../components/assistant/AssistantView";
import FormsSheet from "../components/assistant/forms/FormsSheet";
import TranslationProvider from "../components/i18n/TranslationProvider";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const field = (dialog: HTMLElement, label: string, value: string) => fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });

function stubPdfDownload() {
  const bytes = new Uint8Array(readFileSync(resolve(process.cwd(), "public/pdfs/Vertragsuebernahme.pdf")));
  vi.stubGlobal("fetch", vi.fn(async () => new Response(bytes)));
  URL.createObjectURL = vi.fn(() => "blob:pdf");
  URL.revokeObjectURL = vi.fn();
  return vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
}

describe("Vodafone-Formulare im Assistenten", () => {
  it("öffnet in der Sparte Telco über die Kachel 'Formulare' die Auswahl mit Suche", () => {
    render(<AssistantView />);
    fireEvent.click(screen.getByRole("tab", { name: /D2D/ }));
    fireEvent.click(screen.getByRole("button", { name: /Formulare/ }));
    const dialog = screen.getByRole("dialog", { name: "Vodafone Formulare" });
    expect(within(dialog).getByText("Änderungsmitteilung")).toBeInTheDocument();
    fireEvent.change(within(dialog).getByPlaceholderText("Nach Formular suchen..."), { target: { value: "Todesfall" } });
    expect(within(dialog).queryByText("Änderungsmitteilung")).not.toBeInTheDocument();
    expect(within(dialog).getByText("Vertragsübernahme")).toBeInTheDocument();
  });

  it("verlangt bei der Änderungsmitteilung mindestens einen Bereich und zeigt dessen Felder", async () => {
    const error = vi.spyOn(toast, "error");
    render(<FormsSheet open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Änderungsmitteilung/ }));
    const dialog = screen.getByRole("dialog", { name: "Änderungsmitteilung" });
    fireEvent.click(await within(dialog).findByRole("button", { name: "PDF erstellen" }));
    expect(error).toHaveBeenCalledWith("Bitte wähle mindestens einen Bereich aus, der geändert werden soll.");
    expect(within(dialog).queryByLabelText("Neue IBAN")).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("switch", { name: /Bankverbindung/ }));
    expect(within(dialog).getByLabelText("Neue IBAN")).toBeInTheDocument();
  });

  it("erstellt die Vertragsübernahme und bietet danach die Vodafone-Seite an", async () => {
    const click = stubPdfDownload();
    render(<FormsSheet open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Vertragsübernahme/ }));
    const dialog = screen.getByRole("dialog", { name: "Vertragsübernahme" });
    await within(dialog).findByLabelText("Kundennummer");
    field(dialog, "Kundennummer", "987654");
    const [previousName, nextName] = within(dialog).getAllByLabelText("Name / Firma");
    fireEvent.change(previousName!, { target: { value: "Muster" } });
    fireEvent.change(nextName!, { target: { value: "Neu" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "PDF erstellen" }));
    const link = await within(dialog).findByRole("link", { name: /Vodafone-Seite öffnen/ }, { timeout: 4000 });
    expect(link.getAttribute("href")).toContain("kundennummer=987654");
    expect(click).toHaveBeenCalled();
  });

  it("zeigt die Formulare auf Englisch, wenn die App auf Englisch steht", () => {
    window.localStorage.setItem("language", "en");
    render(
      <TranslationProvider>
        <FormsSheet open onClose={vi.fn()} />
      </TranslationProvider>,
    );
    expect(screen.getByRole("dialog", { name: "Vodafone forms" })).toBeInTheDocument();
    expect(screen.getByText("Contract takeover")).toBeInTheDocument();
  });
});
