import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import AuthProvider from "../components/auth/AuthProvider";
import TranslationProvider from "../components/i18n/TranslationProvider";
import AppShell from "../components/layout/AppShell";
import MapView from "../components/map/MapView";
import ThemeProvider from "../components/theme/ThemeProvider";
import { LOGIN_OK, mockApi } from "./support/renderLogin";
import { setTestUrl } from "./support/navigationMock";

vi.mock("next/navigation", async () => (await import("./support/navigationMock")).navigationMock);
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

/** Rendert den App-Rahmen mit Karte, angemeldet über eine wiederhergestellte Sitzung. */
async function renderShell(url = "/dashboard", role = "teamleiter") {
  window.localStorage.setItem("rememberMe", "true");
  const fetchMock = mockApi({
    "/auth/refresh": { status: 200, body: { success: true, data: { token: "neu" } } },
    "/auth/me": { status: 200, body: { success: true, data: { user: { ...LOGIN_OK.body.data.user, role } } } },
    "/auth/logout": { status: 200, body: { success: true, data: null } },
  });
  setTestUrl(url);
  render(
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <AppShell>
            <MapView />
          </AppShell>
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>,
  );
  await screen.findByTestId("user-menu");
  return fetchMock;
}

describe("App-Rahmen", () => {
  it("zeigt die untere Navigation aus v1 mit Home als aktiver Seite", async () => {
    await renderShell();
    const nav = screen.getByRole("navigation", { name: "Hauptnavigation unten" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/battle",
      "/daily-view",
      "/dashboard",
      "/statistics",
      "/pattern-analysis-demo",
    ]);
    expect(within(nav).getByRole("link", { name: "Laufliste" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Battle" })).not.toHaveAttribute("aria-current");
  });

  it("zeigt oben links den Namen der aktuellen Seite statt des App-Namens", async () => {
    await renderShell("/dashboard");
    expect(screen.getByRole("heading", { level: 1, name: "Karte" })).toBeInTheDocument();
    expect(screen.queryByText("Visit Flow")).toBeNull();
  });

  it("öffnet das Benutzermenü mit Name, Rolle und den Punkten der Rolle wie in v1", async () => {
    await renderShell();
    await userEvent.click(screen.getByTestId("user-menu"));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("Test Berater")).toBeInTheDocument();
    expect(within(menu).getAllByText("Teamleiter").length).toBeGreaterThan(0);
    expect(within(menu).getByRole("menuitem", { name: "Teamleiter Berichte" })).toHaveAttribute("href", "/teamleiter-berichte");
    expect(within(menu).getByRole("menuitem", { name: "Einstellungen" })).toHaveAttribute("href", "/settings");
    expect(within(menu).queryByRole("menuitem", { name: "Admin Dashboard" })).toBeNull();
    expect(within(menu).queryByRole("menuitem", { name: "Datenschutz-Einstellungen" })).toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("lässt Admins wie in v1 in der Topbar die Sparte wechseln", async () => {
    window.localStorage.removeItem("activeVertical");
    await renderShell("/dashboard", "admin");
    await userEvent.click(await screen.findByTestId("vertical-switch"));
    const menu = await screen.findByRole("menu", { name: "Sparte wechseln" });
    expect(within(menu).getAllByRole("menuitemradio").map((item) => item.textContent)).toEqual([
      "Telco (Vodafone)",
      "Energie (Strom/Gas)",
      "Lead (PV-Anlagen)",
    ]);
    await userEvent.click(within(menu).getByRole("menuitemradio", { name: "Lead (PV-Anlagen)" }));
    expect(window.localStorage.getItem("activeVertical")).toBe("solar");
    await waitFor(() => expect(screen.getByTestId("vertical-switch")).toHaveAccessibleName("Sparte wechseln: Lead"));
    window.localStorage.removeItem("activeVertical");
  });

  it("zeigt den Sparten-Umschalter nicht ohne mehrere freigegebene Sparten", async () => {
    await renderShell();
    expect(screen.queryByTestId("vertical-switch")).toBeNull();
  });

  it("meldet über das Menü ab und geht zum Login", async () => {
    const fetchMock = await renderShell();
    await userEvent.click(screen.getByTestId("user-menu"));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Abmelden" }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith("/auth/logout"))).toBe(true));
    expect(window.localStorage.getItem("rememberMe")).toBeNull();
  });

  it("zeigt ohne Mapbox-Schlüssel einen klaren Hinweis statt einer leeren Karte", async () => {
    await renderShell();
    expect(screen.getByRole("alert")).toHaveTextContent("Mapbox-Schlüssel");
  });
});
