import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LOGIN_OK, mockApi, renderLogin } from "./support/renderLogin";

const activeTab = () => screen.getByRole("tab", { selected: true });

describe("Login-Seite", () => {
  it("öffnet wie v1 standardmäßig 'Eigenes Team buchen'", () => {
    renderLogin("/login");
    expect(activeTab()).toHaveTextContent("Team buchen");
    expect(screen.getByText("Visit Flow")).toBeInTheDocument();
    expect(screen.getByText("Willkommen zurück")).toBeInTheDocument();
  });

  it("wählt den Reiter aus der Adresse", () => {
    renderLogin("/login?tab=login");
    expect(activeTab()).toHaveTextContent("Anmelden");
  });

  it("öffnet bei einem Team-Einladungslink den Berater-Beitritt", () => {
    renderLogin("/login?team=abc");
    expect(activeTab()).toHaveTextContent("Beitreten");
  });

  it("öffnet unter /onboarding das Team-Buchen", () => {
    renderLogin("/onboarding?tab=login");
    expect(activeTab()).toHaveTextContent("Team buchen");
  });

  it("stellt mit 'Angemeldet bleiben' die Sitzung wieder her und leitet weiter", async () => {
    window.localStorage.setItem("rememberMe", "true");
    mockApi({
      "/auth/refresh": { status: 200, body: { success: true, data: { token: "neu" } } },
      "/auth/me": { status: 200, body: { success: true, data: { user: LOGIN_OK.body.data.user } } },
    });
    renderLogin();
    expect(screen.getByRole("status")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/dashboard"));
  });

  it("führt nach dem Login zur Seite aus ?from= zurück", async () => {
    window.localStorage.setItem("rememberMe", "true");
    mockApi({
      "/auth/refresh": { status: 200, body: { success: true, data: { token: "neu" } } },
      "/auth/me": { status: 200, body: { success: true, data: { user: LOGIN_OK.body.data.user } } },
    });
    renderLogin("/login?from=%2Fkalender");
    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/kalender"));
  });

  it("vergisst den Merker, wenn die Sitzung abgelaufen ist", async () => {
    window.localStorage.setItem("rememberMe", "true");
    mockApi({ "/auth/refresh": { status: 401, body: { success: false, error: "abgelaufen", message: "abgelaufen" } } });
    renderLogin();
    await screen.findByTestId("login-email");
    expect(window.localStorage.getItem("rememberMe")).toBeNull();
  });
});
