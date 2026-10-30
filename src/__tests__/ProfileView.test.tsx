import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import AuthProvider from "../components/auth/AuthProvider";
import { AuthContext, type AuthContextValue } from "../lib/auth/authContext";
import ProfileView from "../components/profile/ProfileView";

vi.mock("../lib/auth/demoSession", () => ({
  DEMO_LOGIN_ENABLED: true,
  DEMO_ADMIN: { id: "demo-admin", email: "admin@demo.local", name: "Demo Admin", role: "admin" },
  hasDemoSession: () => true,
  setDemoSession: () => undefined,
}));
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

const renderProfile = () =>
  render(
    <AuthProvider>
      <ProfileView />
    </AuthProvider>,
  );

describe("Profilseite (Demo)", () => {
  it("zeigt Kopf mit Nickname, Rolle, Team und Vodafone-Monat und die Gruppen", async () => {
    renderProfile();
    expect(screen.getByRole("heading", { name: "Demo Admin" })).toBeInTheDocument();
    expect(screen.getAllByText("@demoking")).toHaveLength(2);
    expect(await screen.findAllByText("Team Berlin Mitte")).toHaveLength(2);
    expect(screen.getByText("Vodafone-Monat 4 · Junior")).toBeInTheDocument();
    expect(await screen.findByText(/Silber · 340 \/ 500 XP/)).toBeInTheDocument();
    for (const label of ["Heute", "Persönliche Daten", "Rolle & Team", "Leaderboard", "Sicherheit", "Abo & Lizenzen", "Mehr"]) {
      expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /Abrechnung öffnen/ })).toHaveAttribute("href", "/abrechnung");
  });

  it("ändert den Namen und übernimmt ihn sofort in den Kopf", async () => {
    renderProfile();
    await userEvent.click(screen.getByRole("button", { name: /Name & E-Mail/ }));
    const name = await screen.findByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.type(name, "Erika Muster");
    await userEvent.click(screen.getByRole("button", { name: "Speichern" }));
    expect(await screen.findByRole("heading", { name: "Erika Muster" })).toBeInTheDocument();
    expect(JSON.parse(window.sessionStorage.getItem("vf_profile_demo") ?? "{}")).toMatchObject({ name: "Erika Muster" });
  });

  it("prüft das Passwort, bevor es gesendet wird", async () => {
    renderProfile();
    await userEvent.click(screen.getByRole("button", { name: /Passwort ändern/ }));
    await userEvent.type(await screen.findByLabelText("Aktuelles Passwort"), "altesPasswort");
    await userEvent.type(screen.getByLabelText("Neues Passwort"), "kurz");
    await userEvent.click(screen.getByRole("button", { name: "Passwort ändern" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("mindestens 8 Zeichen");
  });

  it("fragt vor dem Anonym-Schalten nach und schaltet erst nach Bestätigung", async () => {
    renderProfile();
    const toggle = screen.getByRole("switch", { name: "Anonym im Leaderboard" });
    await userEvent.click(toggle);
    const dialog = await screen.findByRole("dialog");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.click(within(dialog).getByRole("button", { name: "Ja, anonym werden" }));
    expect(await screen.findByText(/statt deines Namens/)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Anonym im Leaderboard" })).toHaveAttribute("aria-checked", "true");
  });

  it("führt für Datenschutz in die Einstellungen auf den Reiter Sicherheit", async () => {
    renderProfile();
    const link = screen.getByRole("link", { name: /Anmeldung & Datenschutz/ });
    expect(link).toHaveAttribute("href", "/settings");
    await userEvent.click(link);
    expect(window.sessionStorage.getItem("settings_active_tab")).toBe("security");
  });

  it("zeigt die Rechnungen im Dialog", async () => {
    renderProfile();
    await userEvent.click(screen.getByRole("button", { name: /^Rechnungen/ }));
    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findAllByText("Bezahlt")).toHaveLength(2);
    expect(within(dialog).getByText("Offen")).toBeInTheDocument();
  });

  it("zeigt Teamleiter und Admin die Team-Lizenzen mit Verwaltung", async () => {
    renderProfile();
    expect(await screen.findByText("8 von 10")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Lizenzen vergeben" })).toHaveAttribute("aria-valuenow", "8");
    expect(screen.getByRole("link", { name: /Lizenz hinzufügen/ })).toHaveAttribute("href", "/subscription?licensing=true&add=1");
    expect(screen.getByRole("link", { name: /Lizenzen verwalten/ })).toHaveAttribute("href", "/subscription?licensing=true");
  });

  it("zeigt Beratern nur ihre Lizenz, ohne Verwaltung und Rechnungen", async () => {
    const auth = { user: { id: "u1", email: "max@test.de", name: "Max", role: "berater" }, updateUser: () => undefined } as unknown as AuthContextValue;
    render(
      <AuthContext.Provider value={auth}>
        <ProfileView />
      </AuthContext.Provider>,
    );
    expect(await screen.findByText("Über Team Berlin Mitte")).toBeInTheDocument();
    expect(screen.queryByText("Lizenzen verwalten")).not.toBeInTheDocument();
    expect(screen.queryByText("Rechnungen")).not.toBeInTheDocument();
    expect(screen.getByText(/verwaltet dein Teamleiter/)).toBeInTheDocument();
  });

  it("blendet VPKN und Vodafone-Monat außerhalb von Telco aus", () => {
    window.localStorage.setItem("activeVertical", "solar");
    renderProfile();
    expect(screen.queryByText(/Vodafone-Monat/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /VPKN/ })).not.toBeInTheDocument();
    expect(screen.getByText("Leads")).toBeInTheDocument();
  });
});
