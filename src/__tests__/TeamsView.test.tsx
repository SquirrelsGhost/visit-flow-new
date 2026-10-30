import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider from "../components/auth/AuthProvider";
import TeamsView from "../components/teams/TeamsView";

vi.mock("../lib/auth/demoSession", () => ({
  DEMO_LOGIN_ENABLED: true,
  DEMO_ADMIN: { id: "demo-admin", email: "admin@demo.local", name: "Demo Admin", role: "admin" },
  hasDemoSession: () => true,
  setDemoSession: () => undefined,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

const show = () => render(<AuthProvider><TeamsView /></AuthProvider>);

describe("Meine Teams (Demo-Admin)", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("zeigt alle Teams, das eigene aufgeklappt mit seiner Struktur", async () => {
    show();
    expect(await screen.findByText("Team Nord")).toBeInTheDocument();
    expect(screen.getByText("Team Süd")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Team Braun zuklappen/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Julia Wagner zuklappen/ })).toBeInTheDocument();
    expect(screen.queryByText("Hanna Vogel")).not.toBeInTheDocument();
  });

  it("findet Personen in anderen Teams und zeigt, wo sie hängen", async () => {
    show();
    await screen.findByText("Team Nord");
    await userEvent.type(screen.getByPlaceholderText("Name oder E-Mail suchen"), "Emma");
    expect(await screen.findByText("Emma Neumann")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hanna Vogel zuklappen/ })).toBeInTheDocument();
    expect(screen.queryByText("Julia Wagner")).not.toBeInTheDocument();
  });

  it("öffnet eine Person mit Status, Rolle, Lizenz und Admin-Rechten", async () => {
    show();
    await userEvent.click(await screen.findByText("Lukas Berger"));
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByText("Tagesstatus")).toBeInTheDocument();
    expect(await within(sheet).findByText("Lizenz zuweisen")).toBeInTheDocument();
    expect(within(sheet).getByText("Konto sperren")).toBeInTheDocument();
  });
});
