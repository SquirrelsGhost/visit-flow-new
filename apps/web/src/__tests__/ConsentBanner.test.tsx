import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_OPEN_EVENT } from "@visit-flow/shared/consent";
import ConsentBanner from "../components/consent/ConsentBanner";
import { readStoredConsent } from "../lib/consentStorage";

const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true, data: {} }), { status: 201 }));

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
});

describe("ConsentBanner", () => {
  it("zeigt Ablehnen, Auswählen und Alle akzeptieren gleichwertig", () => {
    render(<ConsentBanner />);
    const buttons = ["Ablehnen", "Auswählen", "Alle akzeptieren"].map((name) => screen.getByRole("button", { name }));
    const classes = new Set(buttons.map((button) => button.className));
    expect(classes.size).toBe(1);
  });

  it("speichert eine Ablehnung, protokolliert sie und schließt sich", async () => {
    render(<ConsentBanner />);
    await userEvent.click(screen.getByRole("button", { name: "Ablehnen" }));

    expect(readStoredConsent()?.choice).toEqual({ extern: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/api\/consent$/);
    expect(JSON.parse(String(init.body))).toMatchObject({ choice: { extern: false }, source: "banner" });
  });

  it("lässt sich über den Einstellungs-Link wieder öffnen und behält die Einwilligungs-ID", async () => {
    render(<ConsentBanner />);
    await userEvent.click(screen.getByRole("button", { name: "Alle akzeptieren" }));
    const firstId = readStoredConsent()?.id;

    act(() => {
      window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
    });
    expect(screen.getByText(new RegExp(firstId ?? "fehlt"))).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: "Externe Inhalte" }));
    await userEvent.click(screen.getByRole("button", { name: "Auswahl speichern" }));

    expect(readStoredConsent()).toMatchObject({ id: firstId, choice: { extern: false } });
  });
});
