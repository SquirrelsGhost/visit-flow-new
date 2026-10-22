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
async function renderShell(url = "/dashboard") {
  window.localStorage.setItem("rememberMe", "true");
  const fetchMock = mockApi({
    "/auth/refresh": { status: 200, body: { success: true, data: { token: "neu" } } },
    "/auth/me": { status: 200, body: { success: true, data: { user: { ...LOGIN_OK.body.data.user, role: "teamleiter" } } } },
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

  it("öffnet das Benutzermenü mit Name, Rolle und Datenschutz-Einstellungen", async () => {
    await renderShell();
    await userEvent.click(screen.getByTestId("user-menu"));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("Test Berater")).toBeInTheDocument();
    expect(within(menu).getByText("Teamleiter")).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Datenschutz-Einstellungen" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
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
