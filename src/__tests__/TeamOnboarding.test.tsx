import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { assignedEmails, clampLicenses, monthlyTotal, resizeSlots } from "../lib/onboarding/licenses";
import { LOGIN_OK, mockApi, renderLogin } from "./support/renderLogin";

const TEAM = {
  id: "t1",
  name: "Team Nord",
  advisorCount: 10,
  advisorEmails: ["a@nord.de"],
  licenseCount: 10,
  planId: "team-licenses",
  referralCode: "NORD",
  inviteLink: "https://visit-flow.de/login?team=t1",
};

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Mein Team \/ Agenturname/), "Team Nord");
  await user.type(screen.getByPlaceholderText("Dein Vor- & Nachname"), "Emre Test");
  await user.type(screen.getByPlaceholderText("Deine E-Mail-Adresse"), "chef@nord.de");
  await user.type(screen.getByPlaceholderText("Passwort (mind. 6 Zeichen)"), "geheim123");
  return user;
}

describe("Einzel-Lizenzen", () => {
  it("rechnet pro Lizenz und hält die Anzahl im erlaubten Bereich", () => {
    expect(monthlyTotal(10)).toBe(650);
    expect(clampLicenses(0)).toBe(5);
    expect(clampLicenses(3)).toBe(5);
    expect(clampLicenses(999)).toBe(250);
  });

  it("behält Zuweisungen beim Ändern der Anzahl und zählt nur gültige, eindeutige Adressen", () => {
    expect(resizeSlots(["a@x.de", "b@x.de"], 3)).toEqual(["a@x.de", "b@x.de", ""]);
    expect(resizeSlots(["a@x.de", "b@x.de"], 1)).toEqual(["a@x.de"]);
    expect(assignedEmails(["A@x.de ", "a@x.de", "kaputt", ""])).toEqual(["a@x.de"]);
  });
});

describe("Reiter Eigenes Team buchen", () => {
  it("meldet fehlende Angaben in der Reihenfolge von v1", async () => {
    renderLogin("/login");
    fireEvent.click(await screen.findByTestId("onboarding-submit"));
    expect(await screen.findByText("Bitte gib den Namen deines Teams oder deiner Agentur ein.")).toBeInTheDocument();
  });

  it("bucht Lizenzen einzeln und zeigt die Monatssumme", async () => {
    renderLogin("/login");
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Eine Lizenz mehr" }));
    expect(screen.getByTestId("license-count")).toHaveValue(11);
    await user.click(screen.getByRole("button", { name: "30" }));
    expect(screen.getByText("30 × 65 €")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("license-total")).toHaveTextContent("1.950 €"));
  });

  it("baut das Team auf, zeigt den Einladungslink und öffnet danach das Dashboard", async () => {
    const fetchMock = mockApi({
      "/auth/onboard-team": { status: 201, body: { success: true, data: { user: LOGIN_OK.body.data.user, token: "jwt", team: TEAM } } },
      "/auth/login": LOGIN_OK,
    });
    renderLogin("/login");
    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: /Lizenzen schon jetzt/ }));
    await user.type(screen.getByLabelText("Lizenz 1"), "a@nord.de");
    await user.click(screen.getByTestId("onboarding-submit"));
    expect(await screen.findByText("Team Nord ist bereit!")).toBeInTheDocument();
    expect(screen.getByText("1 von 10")).toBeInTheDocument();
    expect(screen.getByDisplayValue(TEAM.inviteLink)).toBeInTheDocument();
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body).toMatchObject({ teamName: "Team Nord", licenseCount: 10, advisorEmails: ["a@nord.de"], planId: "team-licenses", checkoutMode: "instant" });
    await user.click(screen.getByTestId("onboarding-open-dashboard"));
    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/teamleiter-dashboard"));
  });

  it("zeigt die Fehlermeldung der API", async () => {
    mockApi({ "/auth/onboard-team": { status: 409, body: { success: false, error: "E-Mail bereits vergeben", message: "E-Mail bereits vergeben" } } });
    renderLogin("/login");
    const user = await fillForm();
    await user.click(screen.getByTestId("onboarding-submit"));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-Mail bereits vergeben");
  });
});
