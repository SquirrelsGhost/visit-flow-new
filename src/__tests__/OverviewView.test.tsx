import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import AuthProvider from "../components/auth/AuthProvider";
import OverviewView from "../components/overview/OverviewView";

vi.mock("../lib/auth/demoSession", () => ({
  DEMO_LOGIN_ENABLED: true,
  DEMO_ADMIN: { id: "demo-admin", email: "admin@demo.local", name: "Demo Admin", role: "berater" },
  hasDemoSession: () => true,
  setDemoSession: () => undefined,
}));
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

describe("Übersicht (Demo)", () => {
  it("zeigt den Beispieltag mit Quoten, Ergebnissen und Produkten", () => {
    render(
      <AuthProvider>
        <OverviewView />
      </AuthProvider>,
    );
    expect(screen.getByRole("img", { name: /Antrefferquote: \d+ %/ })).toBeInTheDocument();
    for (const label of ["Vom Klingeln zum Abschluss", "An der Tür", "Produkte heute"]) {
      expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByText("Demo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Zur Karte/ })).toHaveAttribute("href", "/dashboard");
  });
});
