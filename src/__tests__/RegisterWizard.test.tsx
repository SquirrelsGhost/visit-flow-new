import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { checkPassword } from "../lib/register/passwordStrength";
import { contractStartOptions } from "../lib/register/monthOptions";
import { mockApi, renderLogin } from "./support/renderLogin";

const OK = { status: 200, body: { success: true, data: {} } };
const TEAMS = { status: 200, body: { success: true, data: [{ id: "vf1", name: "Vodafone Nord" }, { id: "t2", name: "Team Süd" }] } };

async function toTeamStep() {
  const user = userEvent.setup();
  await user.type(await screen.findByTestId("register-name"), "Max Mustermann");
  await user.type(screen.getByTestId("register-email"), "max@example.com");
  await user.click(screen.getByTestId("register-submit"));
  await screen.findByText("Zu welchem Team gehörst du?");
  return user;
}

describe("Hilfen der Registrierung", () => {
  it("bewertet Passwörter wie v1", () => {
    expect(checkPassword("kurz").isValid).toBe(false);
    expect(checkPassword("Sonne!Wald7").isValid).toBe(true);
  });

  it("bietet fünf Jahre zurück bis drei Monate voraus an", () => {
    const options = contractStartOptions(new Date(2026, 9, 23));
    expect(options).toHaveLength(64);
    expect(options[0].value).toBe("2027-01-01");
    expect(options.at(-1)?.value).toBe("2021-10-01");
  });
});

describe("Reiter Berater-Beitritt", () => {
  it("führt durch Daten, Team, Code und Passwort und wechselt bei Freigabe zum Login", async () => {
    const fetchMock = mockApi({
      "/teams/public/list": TEAMS,
      "/auth/send-verification": OK,
      "/auth/verify-email": OK,
      "/auth/complete-registration": { status: 200, body: { success: true, data: { requiresApproval: true } } },
    });
    renderLogin("/login?tab=register");
    const user = await toTeamStep();
    await user.selectOptions(screen.getByLabelText(/Team \(Optional\)/), "t2");
    await user.selectOptions(screen.getByLabelText(/Vertragsstart/), contractStartOptions()[3].value);
    await user.click(screen.getByTestId("register-submit"));
    await user.type(await screen.findByLabelText(/^Verifizierungscode/), "123456");
    await user.click(screen.getByTestId("register-submit"));
    await user.type(await screen.findByTestId("register-password"), "Sonne!Wald7");
    await user.type(screen.getByTestId("register-confirm-password"), "Sonne!Wald7");
    await user.click(screen.getByTestId("register-submit"));
    await waitFor(() => expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Anmelden"));
    expect(screen.getByTestId("login-email")).toHaveValue("max@example.com");
    const complete = fetchMock.mock.calls.find(([url]) => String(url).endsWith("/auth/complete-registration"));
    expect(JSON.parse(String((complete as unknown as [string, RequestInit])[1].body))).toMatchObject({ requestedTeamId: "t2", verificationCode: "123456" });
  });

  it("verlangt bei Vodafone-Teams die Firmenadresse in zwei Zusatzschritten", async () => {
    mockApi({ "/teams/public/list": TEAMS, "/auth/send-verification": OK });
    renderLogin("/login?team=vf1");
    const user = await toTeamStep();
    expect(screen.getByLabelText("VPKN (optional)")).toBeInTheDocument();
    expect(screen.getByText("Email 2")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/Vertragsstart/), contractStartOptions()[0].value);
    await user.click(screen.getByTestId("register-submit"));
    expect(await screen.findByText(/6-stelligen Code an max@example.com/)).toBeInTheDocument();
  });

  it("zeigt Fehler der API im Formular", async () => {
    mockApi({ "/teams/public/list": TEAMS, "/auth/send-verification": { status: 429, body: { success: false, error: "Zu viele Anfragen", message: "Zu viele Anfragen" } } });
    renderLogin("/login?tab=register");
    const user = await toTeamStep();
    await user.selectOptions(screen.getByLabelText(/Vertragsstart/), contractStartOptions()[0].value);
    await user.click(screen.getByTestId("register-submit"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Zu viele Anfragen");
  });
});
