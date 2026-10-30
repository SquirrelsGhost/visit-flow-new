import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CrmView from "../components/crm/CrmView";
import { resetDemoCrm } from "../lib/crm/crmDemoStore";
import { setTestUrl } from "./support/navigationMock";

vi.mock("../lib/auth/demoSession", () => ({ hasDemoSession: () => true }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "m1", email: "m@demo.local", role: "berater", roles: ["mentor"] } }) }));
vi.mock("next/navigation", async () => (await import("./support/navigationMock")).navigationMock);
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));
vi.mock("../hooks/useProfile", () => ({ useProfile: () => ({ profile: { contractMonth: 6 }, demo: true, save: vi.fn() }) }));

describe("Seite Aufträge (Demo)", () => {
  beforeEach(() => {
    resetDemoCrm();
    setTestUrl("/crm");
    window.localStorage.removeItem("activeVertical");
  });

  it("zeigt Stornoquote, Sales und Stornos des Monats", async () => {
    render(<CrmView />);
    expect(await screen.findByText("Stornoquote")).toBeInTheDocument();
    expect(screen.getByText(/Vertragsmonat 6/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Aktuell/ })).toBeInTheDocument();
  });

  it("filtert auf stornierte Aufträge und zeigt den Stornogrund", async () => {
    render(<CrmView />);
    fireEvent.click(await screen.findByRole("radio", { name: /Storniert/ }));
    const recent = screen.getByRole("region", { name: /Aktuell/ });
    const cards = within(recent).getAllByRole("listitem");
    cards.forEach((card) => expect(card).toHaveTextContent("Storniert"));
    fireEvent.click(within(cards[0]!).getByRole("button", { name: /Details zeigen/ }));
    expect(await within(recent).findByText(/Stornogrund: Widerruf/)).toBeInTheDocument();
  });

  it("storniert einen offenen Auftrag nach Rückfrage", async () => {
    render(<CrmView />);
    fireEvent.click(await screen.findByRole("button", { name: /Familie Krüger – Details zeigen/ }));
    fireEvent.click(screen.getByRole("button", { name: "Stornieren" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("zählt zur Stornoquote");
    fireEvent.click(within(dialog).getByRole("button", { name: "Stornieren" }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Familie Krüger/ }).closest("li")).toHaveTextContent("Storniert"), { timeout: 3000 });
  });

  it("Lead-Bereich: nur Anzeige mit Pipedrive-Hinweis", async () => {
    window.localStorage.setItem("activeVertical", "solar");
    render(<CrmView />);
    expect(await screen.findByText(/automatisch über Pipedrive/)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Approved/ })).toBeInTheDocument();
  });

  it("filtert aus der Straßenliste auf eine Straße und verlinkt zurück", async () => {
    setTestUrl("/crm?strasse=Lindenstra%C3%9Fe&plz=50667&ort=K%C3%B6ln");
    render(<CrmView />);
    expect(await screen.findByText("Lindenstraße · 50667 Köln")).toBeInTheDocument();
    const recent = screen.getByRole("region", { name: /Aktuell/ });
    expect(within(recent).getAllByRole("listitem")).toHaveLength(1);
    fireEvent.click(within(recent).getByRole("button", { name: /Familie Krüger – Details zeigen/ }));
    const open = await within(recent).findByRole("link", { name: /Lindenstraße in der Straßenliste öffnen/ });
    expect(open).toHaveAttribute("href", "/mentor-street-list?strasse=Lindenstra%C3%9Fe&plz=50667&ort=K%C3%B6ln");
    fireEvent.click(screen.getByRole("button", { name: "Straßenfilter entfernen" }));
    await waitFor(() => expect(within(screen.getByRole("region", { name: /Aktuell/ })).getAllByRole("listitem").length).toBeGreaterThan(1));
  });
});
