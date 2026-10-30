import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TranslationProvider from "../components/i18n/TranslationProvider";
import Logbook from "../components/logbook/Logbook";
import { resetDemoLogbook } from "../lib/logbook/logbookStore";

vi.mock("../lib/auth/demoSession", () => ({
  DEMO_LOGIN_ENABLED: true,
  DEMO_ADMIN: { id: "demo-admin", email: "admin@demo.local", name: "Demo Admin", role: "admin" },
  hasDemoSession: () => true,
}));

function renderLogbook() {
  render(
    <TranslationProvider>
      <Logbook userId="demo-admin" driver="Demo Admin" />
    </TranslationProvider>,
  );
}

const tripButtons = () => within(screen.getByRole("region", { name: "Fahrten" })).queryAllByRole("button", { name: /Details zeigen/ });

describe("Fahrtenbuch (Demo)", () => {
  beforeEach(() => resetDemoLogbook());

  it("zeigt Monatskilometer, Fahrten nach Tagen und den Finanzamt-Check", () => {
    renderLogbook();
    expect(screen.getByText("Gefahren im Monat")).toBeInTheDocument();
    expect(screen.getByText("Finanzamt-Check")).toBeInTheDocument();
    expect(screen.getAllByText("Angaben fehlen").length).toBeGreaterThan(0);
    expect(tripButtons().length).toBeGreaterThan(0);
  });

  it("erfasst eine neue Dienstfahrt, die den Kilometerstand fortsetzt", async () => {
    renderLogbook();
    const before = tripButtons().length;
    fireEvent.click(screen.getAllByRole("button", { name: "Neue Fahrt" })[0]!);
    const dialog = await screen.findByRole("dialog");
    const start = Number((within(dialog).getByLabelText("Start km") as HTMLInputElement).value);
    expect(start).toBeGreaterThan(40_000);
    fireEvent.change(within(dialog).getByLabelText("Strecke"), { target: { value: "25" } });
    expect(within(dialog).getByLabelText("Ende km")).toHaveValue(String(start + 25));
    fireEvent.change(within(dialog).getByLabelText("Reiseziel"), { target: { value: "Pulheim: Testweg" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Fahrt speichern" }));
    expect(within(dialog).getByText("Pflichtfeld")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Kundentermin" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Fahrt speichern" }));
    await waitFor(() => expect(tripButtons()).toHaveLength(before + 1));
    expect(screen.getAllByText("Pulheim: Testweg").length).toBeGreaterThan(0);
  });

  it("zeigt den abgeschlossenen Vormonat nur noch lesend", async () => {
    renderLogbook();
    fireEvent.click(screen.getByRole("button", { name: "Vorheriger Monat" }));
    expect(await screen.findByText("Abgeschlossen")).toBeInTheDocument();
    fireEvent.click(tripButtons()[0]!);
    expect(await screen.findByText(/Monat abgeschlossen/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bearbeiten" })).not.toBeInTheDocument();
  });

  it("spricht Englisch, wenn die App auf Englisch steht", () => {
    window.localStorage.setItem("language", "en");
    render(
      <TranslationProvider>
        <Logbook userId="demo-admin" driver="Demo Admin" />
      </TranslationProvider>,
    );
    expect(screen.getByText("Driven this month")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "New trip" }).length).toBeGreaterThan(0);
  });
});
