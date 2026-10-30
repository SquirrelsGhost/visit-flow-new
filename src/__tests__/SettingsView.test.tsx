import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import TranslationProvider from "../components/i18n/TranslationProvider";
import SettingsView from "../components/settings/SettingsView";
import { AuthContext, type AuthContextValue } from "../lib/auth/authContext";
import { CONSENT_OPEN_EVENT } from "@/shared/consent/consent";

vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

function renderSettings(role = "berater") {
  const auth = { user: { id: "u1", email: "max@test.de", role } } as unknown as AuthContextValue;
  render(
    <AuthContext.Provider value={auth}>
      <TranslationProvider>
        <SettingsView />
      </TranslationProvider>
    </AuthContext.Provider>,
  );
}

const stored = () => JSON.parse(window.localStorage.getItem("vf_settings") ?? "{}") as Record<string, unknown>;

describe("Einstellungen", () => {
  it("zeigt die Reiter aus v1 und startet wie v1 auf Persönlich", async () => {
    renderSettings();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["Persönlich", "App", "Sicherheit", "Speicher"]);
    expect(screen.getByRole("tab", { name: "Persönlich" })).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByRole("switch", { name: "Auto-Kilometerstand" })).toHaveAttribute("aria-checked", "true");
  });

  it("schaltet Auto-Kilometerstand aus, speichert lokal und blendet den Kilometerstand aus", async () => {
    renderSettings();
    expect(await screen.findByRole("button", { name: /^Kilometerstand/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: "Auto-Kilometerstand" }));
    expect(screen.getByRole("switch", { name: "Auto-Kilometerstand" })).toHaveAttribute("aria-checked", "false");
    expect(stored().autoKmTracking).toBe(false);
    expect(screen.queryByRole("button", { name: /^Kilometerstand/ })).not.toBeInTheDocument();
  });

  it("verlangt alle Felder der Hausadresse und speichert sie ohne Mapbox-Schlüssel ohne Koordinaten", async () => {
    renderSettings();
    await userEvent.click(await screen.findByRole("button", { name: /Hausadresse/ }));
    await userEvent.type(await screen.findByLabelText("Straße"), "Hauptstraße");
    await userEvent.click(screen.getByRole("button", { name: "Hausadresse speichern" }));
    expect(stored().homeAddress).toBeUndefined();
    await userEvent.type(screen.getByLabelText("Nr."), "5");
    await userEvent.type(screen.getByLabelText("PLZ"), "10115");
    await userEvent.type(screen.getByLabelText("Stadt"), "Berlin");
    await userEvent.click(screen.getByRole("button", { name: "Hausadresse speichern" }));
    expect(await screen.findByText("Hauptstraße 5, 10115 Berlin", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(stored().homeAddress).toEqual({ street: "Hauptstraße", houseNumber: "5", zipCode: "10115", city: "Berlin" });
  }, 15000);

  it("ändert im Reiter App Vorlaufzeit und Sprache", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "App" }));
    await userEvent.selectOptions(await screen.findByLabelText("Termin-Erinnerung"), "30");
    expect(stored().notificationLeadMinutes).toBe(30);
    await userEvent.selectOptions(screen.getByLabelText("Sprache"), "en");
    expect(await screen.findByRole("tab", { name: "Personal" })).toBeInTheDocument();
    expect(window.localStorage.getItem("language")).toBe("en");
  });

  it("zeigt den E-Mail-Bericht nur Admin und Teamleiter", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "App" }));
    expect(await screen.findByRole("switch", { name: "Sound-Benachrichtigungen" })).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: "E-Mail Benachrichtigungen" })).not.toBeInTheDocument();
  });

  it("speichert den E-Mail-Bericht für Teamleiter sofort, auch das Ausschalten", async () => {
    renderSettings("teamleiter");
    await userEvent.click(screen.getByRole("tab", { name: "App" }));
    await userEvent.click(await screen.findByRole("switch", { name: "E-Mail Benachrichtigungen" }));
    await userEvent.selectOptions(await screen.findByLabelText("Uhrzeit"), "07:30");
    expect(stored().emailReport).toEqual({ enabled: true, time: "07:30" });
    await userEvent.click(screen.getByRole("switch", { name: "E-Mail Benachrichtigungen" }));
    expect(stored().emailReport).toEqual({ enabled: false, time: "07:30" });
  });

  it("öffnet im Reiter Sicherheit den Datenschutz und die Einwilligungen", async () => {
    const opened = vi.fn();
    window.addEventListener(CONSENT_OPEN_EVENT, opened);
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "Sicherheit" }));
    expect(await screen.findByRole("link", { name: /Datenschutz & meine Daten/ })).toHaveAttribute("href", "/privacy-settings");
    expect(screen.getByText("Noch keine Auswahl getroffen")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Datenschutz-Einstellungen/ }));
    expect(opened).toHaveBeenCalledTimes(1);
    window.removeEventListener(CONSENT_OPEN_EVENT, opened);
  });

  it("exportiert im Reiter Speicher die persönlichen Einstellungen als JSON", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "Speicher" }));
    const button = await screen.findByRole("button", { name: /Einstellungen exportieren/ });
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await userEvent.click(button);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("merkt sich den gewählten Reiter für die Sitzung", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "App" }));
    expect(screen.getByRole("tab", { name: "App" })).toHaveAttribute("aria-selected", "true");
    expect(window.sessionStorage.getItem("settings_active_tab")).toBe("app");
  });
});
