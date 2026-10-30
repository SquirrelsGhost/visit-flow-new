import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Backoffice from "../components/backoffice/Backoffice";
import BackofficeTeaser from "../components/backoffice/BackofficeTeaser";
import { resetDemoBackoffice } from "../lib/backoffice/backofficeDemoStore";
import { setTestUrl } from "./support/navigationMock";

vi.mock("../lib/auth/demoSession", () => ({ hasDemoSession: () => true }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "demo", email: "tl@demo.local", role: "teamleiter", teamId: "t1" } }) }));
vi.mock("next/navigation", async () => (await import("./support/navigationMock")).navigationMock);
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

const list = () => screen.getByRole("region", { name: "Verkäufe" });

describe("Team-Backoffice (Demo)", () => {
  beforeEach(() => {
    resetDemoBackoffice();
    setTestUrl("/team-backoffice");
  });

  it("startet auf Offen und zeigt den Prüfstapel", async () => {
    render(<Backoffice admin={false} />);
    expect(await screen.findByText("Zur Prüfung offen")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Offen/ })).toHaveAttribute("aria-checked", "true");
    expect(within(list()).getByRole("button", { name: /Familie Krüger/ })).toBeInTheDocument();
    expect(within(list()).queryByRole("button", { name: /Café Linde/ })).not.toBeInTheDocument();
  });

  it("bestätigt einen Kunden nach Rückfrage, danach ist er nicht mehr offen", async () => {
    render(<Backoffice admin={false} />);
    await screen.findByRole("region", { name: "Verkäufe" });
    const card = within(list()).getByRole("button", { name: /Familie Krüger/ }).closest("article")!;
    fireEvent.click(within(card).getByRole("button", { name: /bestätigen/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Bestätigen" }));
    await waitFor(() => expect(within(list()).queryByRole("button", { name: /Familie Krüger/ })).not.toBeInTheDocument(), { timeout: 3000 });
    fireEvent.click(screen.getByRole("radio", { name: /Bestätigt/ }));
    expect(within(list()).getByRole("button", { name: /Familie Krüger/ })).toBeInTheDocument();
  });

  it("storniert mit Grund", async () => {
    render(<Backoffice admin={false} />);
    await screen.findByRole("region", { name: "Verkäufe" });
    const card = within(list()).getByRole("button", { name: /Familie Krüger/ }).closest("article")!;
    fireEvent.click(within(card).getByRole("button", { name: /stornieren/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Widerruf" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Stornieren" }));
    await waitFor(() => expect(within(list()).queryByRole("button", { name: /Familie Krüger/ })).not.toBeInTheDocument(), { timeout: 3000 });
    fireEvent.click(screen.getByRole("radio", { name: /Storniert/ }));
    fireEvent.click(within(list()).getByRole("button", { name: /Familie Krüger – Details zeigen/ }));
    expect(await screen.findAllByText("Verlustgrund: Widerruf")).not.toHaveLength(0);
  });

  it("startet aus der Straßenliste auf Alle mit der Straße; ohne eigene Straßenliste kein Rücklink", async () => {
    setTestUrl("/team-backoffice?strasse=Lindenallee&plz=50667&ort=K%C3%B6ln");
    render(<Backoffice admin={false} />);
    expect(await screen.findByText("Lindenallee · 50667 Köln")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Alle/ })).toHaveAttribute("aria-checked", "true");
    const items = within(list()).getAllByRole("listitem");
    items.forEach((item) => expect(item).toHaveTextContent("Familie Krüger"));
    expect(screen.queryByRole("link", { name: /in der Straßenliste öffnen/ })).not.toBeInTheDocument();
  });
});

describe("Angebot ohne Add-on", () => {
  it("zeigt Richtpreis und Anfrage per E-Mail", () => {
    render(<BackofficeTeaser preview={false} />);
    expect(screen.getByText("79 €")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Freischalten anfragen/ })).toHaveAttribute("href", expect.stringContaining("mailto:support@visit-flow.com"));
  });
});
