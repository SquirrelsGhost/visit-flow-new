import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CrmOverview from "../components/crmOverview/CrmOverview";
import { resetDemoOverview } from "../lib/crmOverview/overviewDemoStore";
import { setTestUrl } from "./support/navigationMock";

vi.mock("../lib/auth/demoSession", () => ({ hasDemoSession: () => true }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "a1", email: "admin@demo.local", role: "admin" } }) }));
vi.mock("next/navigation", async () => (await import("./support/navigationMock")).navigationMock);
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

describe("CRM-Übersicht (Demo)", () => {
  beforeEach(() => {
    resetDemoOverview();
    setTestUrl("/admin-crm-overview");
  });

  it("zeigt Kennzahlen und die Kunden von heute", async () => {
    render(<CrmOverview />);
    expect(await screen.findByText(/Alle Verkäufer · Heute/)).toBeInTheDocument();
    const list = screen.getByRole("region", { name: "Kunden" });
    expect(within(list).getByRole("button", { name: /Familie Krüger/ })).toBeInTheDocument();
    expect(within(list).queryByRole("button", { name: /Café Linde/ })).not.toBeInTheDocument();
  });

  it("zeigt mit Gesamt alle Kunden und filtert auf Probleme", async () => {
    render(<CrmOverview />);
    fireEvent.click(await screen.findByRole("radio", { name: "Gesamt" }));
    const list = screen.getByRole("region", { name: "Kunden" });
    expect(within(list).getByRole("button", { name: /Café Linde/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: /Nur Probleme/ }));
    within(list).getAllByRole("listitem").forEach((item) => expect(item).toHaveTextContent(/Kein Kundenname|Keine Adresse/));
  });

  it("löscht ein Produkt nach Rückfrage", async () => {
    render(<CrmOverview />);
    fireEvent.click(await screen.findByRole("button", { name: /Familie Krüger – Details zeigen/ }));
    const before = screen.getAllByRole("button", { name: /Produkt löschen/ }).length;
    fireEvent.click(screen.getAllByRole("button", { name: /Produkt löschen/ })[0]!);
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Löschen" }));
    await waitFor(() => expect(screen.getAllByRole("button", { name: /Produkt löschen/ })).toHaveLength(before - 1), { timeout: 3000 });
  });

  it("zeigt aus der Straßenliste alle Verkäufe der Straße über den ganzen Zeitraum", async () => {
    setTestUrl("/admin-crm-overview?strasse=Hauptstra%C3%9Fe&plz=50667");
    render(<CrmOverview />);
    expect(await screen.findByText("Hauptstraße · 50667")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Gesamt" })).toHaveAttribute("aria-checked", "true");
    const list = screen.getByRole("region", { name: "Kunden" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Bäckerei Sommer");
  });
});
