import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TranslationProvider from "../components/i18n/TranslationProvider";
import SecurityDashboard from "../components/security/SecurityDashboard";
import { resetDemoSecurity } from "../lib/security/securityDemoStore";

vi.mock("../lib/auth/demoSession", () => ({
  DEMO_LOGIN_ENABLED: true,
  DEMO_ADMIN: { id: "demo-admin", email: "admin@demo.local", name: "Demo Admin", role: "admin" },
  hasDemoSession: () => true,
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const renderPage = () =>
  render(
    <TranslationProvider>
      <SecurityDashboard />
    </TranslationProvider>,
  );

describe("Security Dashboard (Demo)", () => {
  beforeEach(() => {
    resetDemoSecurity();
    window.localStorage.clear();
  });

  it("zeigt den Sicherheitswert aus Sperren, Login-Sperren und offenen Alarmen", async () => {
    renderPage();
    // 8 Sperren (−16), 2 Login-Sperren (−10), 2 offene Alarme (−6) = 68
    const ring = await screen.findByRole("meter", { name: "Sicherheitswert" });
    expect(ring).toHaveAttribute("aria-valuenow", "68");
    expect(screen.getByText("Achtung")).toBeInTheDocument();
  });

  it("entsperrt einen Login nach Rückfrage", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Entsperren 79.234.18.201" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Entsperren" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Entsperren 79.234.18.201" })).not.toBeInTheDocument(), { timeout: 3000 });
  });

  it("filtert die Firewall nach Art und sucht", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("tab", { name: /Firewall/ }));
    const list = await screen.findByRole("region", { name: "Gesperrte IPs" });
    expect(within(list).getAllByRole("button", { name: /Details zeigen/ })).toHaveLength(8);
    fireEvent.click(screen.getByRole("radio", { name: /Honeypot/ }));
    expect(within(list).getAllByRole("button", { name: /Details zeigen/ })).toHaveLength(2);
    fireEvent.change(screen.getByPlaceholderText("IP, E-Mail, Land, Anbieter oder Grund"), { target: { value: "vilnius" } });
    expect(within(list).getAllByRole("button", { name: /Details zeigen/ })).toHaveLength(1);
  });

  it("zeigt das Protokoll und filtert nach Bereich", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("tab", { name: /Protokoll/ }));
    const list = await screen.findByRole("region", { name: "Einträge" });
    expect(within(list).getAllByRole("button", { name: /Details zeigen/ })).toHaveLength(14);
    fireEvent.click(screen.getByRole("radio", { name: "System" }));
    await waitFor(() => expect(within(screen.getByRole("region", { name: "Einträge" })).getAllByRole("button", { name: /Details zeigen/ })).toHaveLength(2));
  });

  it("spricht Englisch, wenn die App auf Englisch steht", async () => {
    window.localStorage.setItem("language", "en");
    renderPage();
    expect(await screen.findByRole("meter", { name: "Security score" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Audit log/ })).toBeInTheDocument();
  });
});
