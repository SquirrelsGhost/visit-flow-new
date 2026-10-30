import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AbrechnungView from "../components/abrechnung/AbrechnungView";
import { resetDemoAbrechnung } from "../lib/abrechnung/abrechnungDemoStore";

vi.mock("../lib/auth/demoSession", () => ({ hasDemoSession: () => true }));

describe("Seite Abrechnung (Demo)", () => {
  beforeEach(() => resetDemoAbrechnung());

  it("zeigt im laufenden Monat den Upload und offene Punkte aus früheren Monaten", async () => {
    render(<AbrechnungView />);
    expect(await screen.findByText(/hochladen/)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /Offene Punkte/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nächster Monat" })).toBeDisabled();
  });

  it("blättert in den Vormonat und filtert die Positionen", async () => {
    render(<AbrechnungView />);
    fireEvent.click(screen.getByRole("button", { name: "Vorheriger Monat" }));
    const positions = await screen.findByRole("region", { name: /Alle Positionen/ });
    expect(screen.getByRole("heading", { name: /Verlauf/ })).toBeInTheDocument();
    const chip = within(positions).getByRole("button", { name: /^Nicht in der App/ });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    const rows = within(positions).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    rows.forEach((row) => expect(row).toHaveTextContent("Nicht in der App"));
  });

  it("folgt dem Bereich: Lead zeigt die Leadabrechnung", async () => {
    window.localStorage.setItem("activeVertical", "solar");
    render(<AbrechnungView />);
    expect(screen.getByText(/Leadabrechnung/)).toBeInTheDocument();
    expect(await screen.findByText(/getrackten Leads abgeglichen/)).toBeInTheDocument();
  });
});
