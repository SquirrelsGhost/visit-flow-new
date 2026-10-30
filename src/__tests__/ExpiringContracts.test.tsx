import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ExpiringContracts from "../components/expiring/ExpiringContracts";
import { resetDemoExpiring } from "../lib/expiring/expiringDemoStore";

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

describe("Verträge vor Ablauf (Demo)", () => {
  beforeEach(() => resetDemoExpiring());

  it("zeigt alle Verträge der nächsten 90 Tage, dringende zuerst", async () => {
    render(<ExpiringContracts />);
    const list = await screen.findByRole("region", { name: "Verträge" });
    const cards = within(list).getAllByRole("button", { name: /Details zeigen/ });
    expect(cards).toHaveLength(17);
    expect(cards[0]).toHaveAccessibleName(/Familie Krüger, 3 Tage/);
    expect(within(list).getByText(/Dringend · unter 30 Tagen · 6/)).toBeInTheDocument();
  });

  it("filtert über die Zonen der Zeitachse auf eine Dringlichkeit", async () => {
    render(<ExpiringContracts />);
    fireEvent.click(await screen.findByRole("radio", { name: /Später/ }));
    const list = screen.getByRole("region", { name: "Verträge" });
    expect(within(list).getAllByRole("button", { name: /Details zeigen/ })).toHaveLength(5);
    expect(within(list).queryByText(/Dringend ·/)).not.toBeInTheDocument();
  });

  it("weist einem Lead einen Berater zu", async () => {
    render(<ExpiringContracts />);
    fireEvent.click(await screen.findByRole("button", { name: /Familie Krüger/ }));
    fireEvent.click(screen.getByRole("button", { name: "Berater zuweisen" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(await within(dialog).findByRole("radio", { name: /Lukas Berger/ }));
    fireEvent.click(within(dialog).getByRole("button", { name: /Zuweisen: Lukas Berger/ }));
    await waitFor(() => expect(screen.getByText("Zugewiesen an")).toBeInTheDocument(), { timeout: 3000 });
  });
});
