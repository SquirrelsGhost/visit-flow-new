import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import AuthProvider from "../components/auth/AuthProvider";
import TranslationProvider from "../components/i18n/TranslationProvider";
import BottomNav from "../components/layout/BottomNav";
import ThemeProvider from "../components/theme/ThemeProvider";
import { LOGIN_OK, mockApi } from "./support/renderLogin";
import { setTestUrl } from "./support/navigationMock";

vi.mock("next/navigation", async () => (await import("./support/navigationMock")).navigationMock);
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

async function renderNav() {
  window.localStorage.setItem("rememberMe", "true");
  mockApi({
    "/auth/refresh": { status: 200, body: { success: true, data: { token: "neu" } } },
    "/auth/me": { status: 200, body: { success: true, data: { user: { ...LOGIN_OK.body.data.user, role: "berater" } } } },
  });
  setTestUrl("/dashboard");
  render(
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <BottomNav />
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>,
  );
  const nav = screen.getByRole("navigation", { name: "Hauptnavigation unten" });
  await waitFor(() => expect(within(nav).getByRole("link", { name: "Rechner" })).toBeInTheDocument());
  return nav;
}

/** Je Platz der zuletzt gerenderte Link; in jsdom laufen Ausblend-Animationen nicht zu Ende, der alte bleibt davor stehen. */
/** Rechtsklick wie im Browser: pointerdown mit rechter Taste, contextmenu, pointerup. */
async function rightClick(el: HTMLElement) {
  fireEvent.pointerDown(el, { pointerType: "mouse", button: 2 });
  fireEvent.contextMenu(el);
  fireEvent.pointerUp(el, { pointerType: "mouse", button: 2 });
  // Der Klick-Schutz nach dem Loslassen läuft kurz nach
  await new Promise((resolve) => setTimeout(resolve, 400));
}

const hrefs = (nav: HTMLElement) =>
  within(nav)
    .getAllByRole("listitem")
    .map((li) => within(li).queryAllByRole("link").at(-1)?.getAttribute("href"))
    .filter(Boolean);

describe("Anpassbare untere Leiste", () => {
  it("ersetzt Rechner nach langem Drücken durch Aufträge und speichert die Wahl", async () => {
    const nav = await renderNav();
    await rightClick(within(nav).getByRole("link", { name: "Rechner" }));
    const sheet = await screen.findByRole("dialog", { name: "Leiste anpassen" });
    expect(within(sheet).getByRole("radio", { name: /Rechner/ })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(within(sheet).getByRole("radio", { name: /Aufträge/ }));
    await waitFor(() => expect(hrefs(nav)).toEqual(["/battle", "/daily-view", "/dashboard", "/crm", "/pattern-analysis-demo"]));
    expect(JSON.parse(window.localStorage.getItem("vf_settings") ?? "{}").bottomNavSlots).toEqual([null, null, "crm", null]);
  });

  it("öffnet beim Halten mit dem Finger, ohne die Seite zu wechseln", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const nav = await renderNav();
    const battle = within(nav).getByRole("link", { name: "Battle" });
    fireEvent.pointerDown(battle, { pointerType: "touch", clientX: 10, clientY: 10 });
    vi.advanceTimersByTime(500);
    fireEvent.pointerUp(battle, { pointerType: "touch" });
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    battle.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    vi.useRealTimers();
    expect(await screen.findByRole("dialog", { name: "Leiste anpassen" })).toBeInTheDocument();
  });

  it("tauscht belegte Seiten und setzt auf Standard zurück", async () => {
    const nav = await renderNav();
    await rightClick(within(nav).getByRole("link", { name: "Battle" }));
    let sheet = await screen.findByRole("dialog", { name: "Leiste anpassen" });
    expect(within(sheet).getByRole("radio", { name: /Assistent/ })).toHaveTextContent("Tauscht mit Platz ganz rechts");
    await userEvent.click(within(sheet).getByRole("radio", { name: /Assistent/ }));
    await waitFor(() => expect(hrefs(nav)).toEqual(["/pattern-analysis-demo", "/daily-view", "/dashboard", "/statistics", "/battle"]));
    await rightClick(within(nav).getByRole("link", { name: "Übersicht" }));
    sheet = await screen.findByRole("dialog", { name: "Leiste anpassen" });
    await userEvent.click(within(sheet).getByRole("button", { name: "Zurücksetzen auf Standard" }));
    expect(JSON.parse(window.localStorage.getItem("vf_settings") ?? "{}").bottomNavSlots).toBeUndefined();
    await rightClick(within(nav).getByRole("link", { name: "Übersicht" }));
    sheet = await screen.findByRole("dialog", { name: "Leiste anpassen" });
    expect(within(sheet).getByRole("button", { name: "Zurücksetzen auf Standard" })).toBeDisabled();
  });
});
