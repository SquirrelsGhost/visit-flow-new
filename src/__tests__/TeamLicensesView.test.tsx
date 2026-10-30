import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider from "../components/auth/AuthProvider";
import TeamLicensesView from "../components/licenses/TeamLicensesView";
import { AuthContext, type AuthContextValue } from "../lib/auth/authContext";

vi.mock("../lib/auth/demoSession", () => ({
  DEMO_LOGIN_ENABLED: true,
  DEMO_ADMIN: { id: "demo-admin", email: "admin@demo.local", name: "Demo Admin", role: "admin" },
  hasDemoSession: () => true,
  setDemoSession: () => undefined,
}));
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

const renderAdmin = () =>
  render(
    <AuthProvider>
      <TeamLicensesView />
    </AuthProvider>,
  );

beforeEach(() => window.sessionStorage.removeItem("vf_licenses_demo"));

/** Belegung in Prozent am Ring der Kopfkarte. */
const usage = async (percent: number) => expect(await screen.findByRole("meter", { name: "Lizenzen vergeben" })).toHaveAttribute("aria-valuenow", String(percent));

describe("Team-Lizenzierung (Demo)", () => {
  it("zeigt Belegung, Kosten, Mitglieder mit Status und Abrechnung", async () => {
    renderAdmin();
    await usage(80);
    expect(screen.getByText("von 10")).toBeInTheDocument();
    expect(screen.getByText("2 frei")).toBeInTheDocument();
    expect(screen.getByText("Lena Wagner")).toBeInTheDocument();
    expect(screen.getAllByText("Freie Lizenz")).toHaveLength(2);
    for (const label of ["Mitglieder", "Partner (Selbstzahler)", "Abrechnung"]) expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
    expect(screen.getByText("10 × 65 €")).toBeInTheDocument();
  });

  it("filtert über Chips und Suche", async () => {
    renderAdmin();
    await usage(80);
    await userEvent.click(screen.getByRole("radio", { name: /Eingeladen/ }));
    expect(screen.getByText("kim.weber@gmail.com")).toBeInTheDocument();
    expect(screen.queryByText("Lena Wagner")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /Alle/ }));
    await userEvent.type(screen.getByRole("searchbox"), "noah");
    expect(screen.getByText("Noah Richter")).toBeInTheDocument();
    expect(screen.queryByText("Freie Lizenz")).not.toBeInTheDocument();
  });

  it("weist eine freie Lizenz zu und prüft doppelte Adressen", async () => {
    renderAdmin();
    await usage(80);
    await userEvent.click(screen.getAllByText("Freie Lizenz")[0]!);
    const sheet = await screen.findByRole("dialog", { name: "Lizenz zuweisen" });
    const field = within(sheet).getByLabelText("E-Mail-Adresse");
    await userEvent.type(field, "lena.wagner@team-mitte.de");
    await userEvent.click(within(sheet).getByRole("button", { name: "Zuweisen" }));
    expect(await within(sheet).findByRole("alert")).toHaveTextContent("schon eine Lizenz");
    await userEvent.clear(field);
    await userEvent.type(field, "neu@team.de");
    await userEvent.click(within(sheet).getByRole("button", { name: "Zuweisen" }));
    await waitFor(() => expect(screen.getByText("1 frei")).toBeInTheDocument());
    expect(screen.getByText(/neu@team\.de/)).toBeInTheDocument();
  });

  it("entzieht eine Lizenz erst nach Rückfrage", async () => {
    renderAdmin();
    await userEvent.click(await screen.findByText("Tim Hoffmann"));
    const sheet = await screen.findByRole("dialog", { name: "Tim Hoffmann" });
    await userEvent.click(within(sheet).getByRole("button", { name: "Lizenz entziehen" }));
    expect(await within(sheet).findByRole("alert")).toHaveTextContent("verliert sofort den Zugang");
    await userEvent.click(await within(sheet).findByRole("button", { name: "Ja, entziehen" }));
    await waitFor(() => expect(screen.getByText("3 frei")).toBeInTheDocument());
  });

  it("passt die Anzahl an und zeigt die neuen Kosten", async () => {
    renderAdmin();
    await usage(80);
    await userEvent.click(screen.getByRole("button", { name: "Hinzufügen" }));
    const sheet = await screen.findByRole("dialog", { name: "Lizenzen anpassen" });
    expect(within(sheet).getByText("715,00 €")).toBeInTheDocument();
    await userEvent.click(within(sheet).getByRole("button", { name: "Kostenpflichtig ändern" }));
    await waitFor(() => expect(screen.getByText("von 11")).toBeInTheDocument());
  });

  it("zeigt eine Überbelegung in Bernstein mit Hinweis", async () => {
    window.sessionStorage.setItem("vf_licenses_demo", JSON.stringify({ licenseCount: 6 }));
    renderAdmin();
    expect(await screen.findByText("2 über dem Limit")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Passe die Anzahl an");
    expect(screen.queryByText("Freie Lizenz")).not.toBeInTheDocument();
  });

  it("zeigt Beratern nur ihre eigene Lizenz", async () => {
    const auth = { user: { id: "u1", email: "max@test.de", name: "Max", role: "berater" }, updateUser: () => undefined } as unknown as AuthContextValue;
    render(
      <AuthContext.Provider value={auth}>
        <TeamLicensesView />
      </AuthContext.Provider>,
    );
    expect(await screen.findByText("Lizenz über dein Team")).toBeInTheDocument();
    expect(screen.queryByText("Mitglieder")).not.toBeInTheDocument();
  });
});
