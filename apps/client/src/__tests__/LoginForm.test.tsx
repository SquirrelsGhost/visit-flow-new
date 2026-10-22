import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getAccessToken } from "../lib/auth/accessToken";
import { LOGIN_OK, mockApi, renderLogin } from "./support/renderLogin";

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(screen.getByTestId("login-email"), email);
  await userEvent.type(screen.getByTestId("login-password"), password);
  await userEvent.click(screen.getByTestId("login-submit"));
}

describe("LoginForm", () => {
  it("zeigt Felder und Button wie v1, ohne Test-Zugänge", () => {
    renderLogin();
    expect(screen.getByTestId("login-email")).toBeInTheDocument();
    expect(screen.getByTestId("login-password")).toBeInTheDocument();
    expect(screen.getByTestId("login-submit")).toBeDisabled();
    expect(screen.queryByText(/Demo-Zugang/)).toBeNull();
  });

  it("meldet an, merkt sich nichts im localStorage und geht zum Dashboard", async () => {
    const fetchMock = mockApi({ "/auth/login": LOGIN_OK });
    renderLogin();
    await fillAndSubmit(" Test@Example.com ", "geheim");

    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/dashboard"));
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ email: "Test@Example.com", password: "geheim" });
    expect(init.credentials).toBe("include");
    expect(getAccessToken()).toBe("jwt");
    expect(window.localStorage.getItem("auth_token")).toBeNull();
    expect(window.localStorage.getItem("rememberMe")).toBeNull();
    expect(window.localStorage.getItem("showTeamLeiterLiveTracking")).toBe("false");
  });

  it("speichert 'Angemeldet bleiben' nur als Merker", async () => {
    mockApi({ "/auth/login": LOGIN_OK });
    renderLogin();
    await userEvent.click(screen.getByTestId("login-remember-me"));
    expect(screen.getByTestId("login-remember-me")).toHaveAttribute("aria-checked", "true");
    await fillAndSubmit("test@example.com", "geheim");
    await waitFor(() => expect(window.localStorage.getItem("rememberMe")).toBe("true"));
  });

  it("zeigt die Fehlermeldung des Servers im roten Kasten", async () => {
    const message = "E-Mail-Adresse oder Passwort ist falsch.";
    mockApi({ "/auth/login": { status: 401, body: { success: false, error: message, message } } });
    renderLogin();
    await fillAndSubmit("test@example.com", "falsch");

    const box = await screen.findByRole("alert");
    expect(box).toHaveTextContent(message);
    expect(box).toHaveAttribute("data-error-kind", "generic");
    expect(screen.queryByTestId("current-path")).toBeNull();
  });

  it("färbt Sperren nach zu vielen Versuchen orange und Netzwerkfehler gelb", async () => {
    const locked = "Zu viele fehlgeschlagene Login-Versuche. Bitte warten Sie und versuchen Sie es später erneut.";
    mockApi({ "/auth/login": { status: 429, body: { success: false, error: locked, message: locked } } });
    renderLogin();
    await fillAndSubmit("test@example.com", "falsch");
    expect(await screen.findByRole("alert")).toHaveAttribute("data-error-kind", "rateLimit");

    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    await userEvent.type(screen.getByTestId("login-password"), "x");
    await userEvent.click(screen.getByTestId("login-submit"));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveAttribute("data-error-kind", "network"));
  });

  it("zeigt Pflichtfeld-Hinweise erst nach dem Verlassen eines leeren Feldes", async () => {
    renderLogin();
    expect(screen.queryByText("E-Mail oder Name ist erforderlich")).toBeNull();
    await userEvent.click(screen.getByTestId("login-email"));
    await userEvent.tab();
    expect(screen.getByText("E-Mail oder Name ist erforderlich")).toBeInTheDocument();
    await userEvent.type(screen.getByTestId("login-email"), "a");
    expect(screen.queryByText("E-Mail oder Name ist erforderlich")).toBeNull();
  });

  it("verlinkt 'Passwort vergessen' mit der eingegebenen E-Mail", async () => {
    renderLogin();
    await userEvent.type(screen.getByTestId("login-email"), "a@b.de");
    expect(screen.getByRole("link", { name: "Passwort vergessen?" })).toHaveAttribute("href", "/forgot-password?email=a%40b.de");
  });
});
