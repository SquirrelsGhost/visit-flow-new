import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider from "../components/auth/AuthProvider";
import SimulatorView from "../components/simulator/SimulatorView";
import { setVertical } from "../hooks/useVertical";

vi.mock("../lib/auth/demoSession", () => ({
  DEMO_LOGIN_ENABLED: true,
  DEMO_ADMIN: { id: "demo-admin", email: "admin@demo.local", name: "Demo Admin", role: "admin" },
  hasDemoSession: () => true,
  setDemoSession: () => undefined,
}));

const renderSimulator = () =>
  render(
    <AuthProvider>
      <SimulatorView />
    </AuthProvider>,
  );

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("Provisions-Simulator (Demo)", () => {
  // jsdom kennt keinen IntersectionObserver (Ergebnisleiste beim Scrollen)
  beforeEach(() => vi.stubGlobal("IntersectionObserver", NoopObserver));

  it("Telco: Vodafone-Monat aus dem Profil, Tarif antippen legt KIP und TV Connect in den Warenkorb", async () => {
    renderSimulator();
    expect(await screen.findByText("Telco · Vodafone")).toBeInTheDocument();
    // Demo-Profil steht in Monat 4 (Junior)
    expect(screen.getByRole("radio", { name: "4" })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByText("Berater-Level")).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "Giga Zuhause 1000 Kabel hinzufügen" }));
    expect(screen.getByText("TV Connect zuhause")).toBeInTheDocument();
    expect(screen.getByText("+175,00 €")).toBeInTheDocument();
    expect(screen.getByText("+30,00 €")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Bonus-Staffeln · Monat 4/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Giga Zuhause 1000 Kabel eins mehr" }));
    expect(screen.getByText("+350,00 €")).toBeInTheDocument();
  });

  it("Telco: ab Monat 5 gibt es Level und Stornoquote, der Autopilot füllt den Warenkorb", async () => {
    renderSimulator();
    await userEvent.click(await screen.findByRole("radio", { name: "7–12" }));
    expect(screen.getByRole("heading", { name: "Berater-Level" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Stornoquote ≤ 15 %" })).toHaveAttribute("aria-checked", "true");

    await userEvent.click(screen.getByRole("button", { name: "10 Tsd. €" }));
    expect(await screen.findByText("Upsell Grade 4 (≥15€ Diff.)")).toBeInTheDocument();
    expect(screen.getByText("GigaMobil XS")).toBeInTheDocument();
  });

  it("Lead: Stufe aus der Rolle, 100-Nettos-Regel und Speichern als Ziel", async () => {
    act(() => setVertical("solar"));
    renderSimulator();
    expect(await screen.findByText("Lead · TrioHeim")).toBeInTheDocument();
    // Admin rechnet als Partner (v1)
    expect(screen.getByRole("radio", { name: /Partner/ })).toHaveAttribute("aria-checked", "true");

    await userEvent.click(screen.getByRole("radio", { name: /Berater/ }));
    expect(screen.getByText("100-Nettos-Regel aktiv: +10 € rückwirkend")).toBeInTheDocument();
    expect(screen.getByText("100 Netto-Leads × 90 €")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Als Ziel setzen" }));
    const goal = JSON.parse(window.localStorage.getItem("provisionGoal") ?? "{}");
    expect(goal).toMatchObject({ targetTotal: 9000, targetTotalProducts: 100, products: [{ name: "Lead", category: "Solar_PV", quantity: 100 }] });
  });

  it("Energie: Hinweis statt geschätzter Provision, solange keine Provisionstabelle da ist", async () => {
    act(() => setVertical("energy"));
    renderSimulator();
    expect(await screen.findByText("Energie · Strom & Gas")).toBeInTheDocument();
    expect(screen.getByText("Provision für Strom & Gas folgt")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Als Ziel setzen" })).not.toBeInTheDocument();
  });
});
