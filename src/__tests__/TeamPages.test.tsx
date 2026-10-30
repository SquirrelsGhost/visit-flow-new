import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import AuthProvider from "../components/auth/AuthProvider";
import DailyStatusView from "../components/dailyStatus/DailyStatusView";
import TeamPerformanceView from "../components/teamPerformance/TeamPerformanceView";

vi.mock("../lib/auth/demoSession", () => ({
  DEMO_LOGIN_ENABLED: true,
  DEMO_ADMIN: { id: "demo-admin", email: "admin@demo.local", name: "Demo Admin", role: "admin" },
  hasDemoSession: () => true,
  setDemoSession: () => undefined,
}));
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

const withAuth = (ui: React.ReactNode) => render(<AuthProvider>{ui}</AuthProvider>);

describe("Tagesstatus (Demo)", () => {
  it("zeigt den eigenen Status, die Wahl und die Anwesenheit des Beispielteams", async () => {
    withAuth(<DailyStatusView />);
    expect(screen.getByText("Dein Status heute")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Voll aktiv/ })).toHaveAttribute("aria-checked", "true");
    expect(await screen.findByRole("button", { name: /Noah Fischer/ })).toHaveTextContent("Anfrage");
    expect(screen.getByRole("link", { name: /Battle/ })).toHaveAttribute("href", "/battle");
  });

  it("klappt bei Krank Zeitraum und Grund auf", async () => {
    withAuth(<DailyStatusView />);
    await userEvent.click(screen.getByRole("radio", { name: /Krank/ }));
    expect(screen.getByText("Grund (optional)")).toBeInTheDocument();
    expect(screen.getByText("Von")).toBeInTheDocument();
  });

  it("öffnet für eine Person die Aktionen und bearbeitet ihren Status oben", async () => {
    withAuth(<DailyStatusView />);
    await userEvent.click(await screen.findByRole("button", { name: /Noah Fischer/ }));
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByText("Abwesenheit bestätigen")).toBeInTheDocument();
    await userEvent.click(within(sheet).getByText("Tagesstatus ändern"));
    expect(await screen.findByText("Status von Noah Fischer")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Krank/ })).toHaveAttribute("aria-checked", "true");
  });
});

describe("Teamleistung (Demo)", () => {
  it("zeigt Umsatz, Verlauf und die Verknüpfungen zu Übersicht, Tagesstatus und Battle", async () => {
    withAuth(<TeamPerformanceView />);
    expect(await screen.findByRole("img", { name: /Türen · Letzte 30 Tage/ })).toBeInTheDocument();
    expect(screen.getByText("Bester Tag")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Team heute/ })).toHaveAttribute("href", "/battle");
    expect(screen.getByRole("link", { name: /Deine Türen heute/ })).toHaveAttribute("href", "/daily-view");
    expect(await screen.findByRole("link", { name: /Anwesenheit/ })).toHaveAttribute("href", "/daily-status");
    await userEvent.click(screen.getByRole("radio", { name: /7 Tage/ }));
    expect(await screen.findByRole("img", { name: /Türen · Letzte 7 Tage/ })).toBeInTheDocument();
  });
});
